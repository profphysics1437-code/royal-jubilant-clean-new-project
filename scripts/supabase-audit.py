#!/usr/bin/env python3
"""
Supabase Database Audit Script
==============================
Reads via PostgREST REST API using the service_role key (bypasses RLS).
Produces a comprehensive audit report covering:

  1. All tables + row counts
  2. Property table — schema, image data quality, test/dummy records
  3. Agent table — completeness (missing photo / phone / whatsapp)
  4. Property ↔ User ↔ Agent relationship integrity
  5. Other key tables (Community, Developer, BlogPost, etc.)
  6. Image URL spot-check (broken/duplicate detection)
  7. Recommendations
"""

import json
import os
import re
import sys
from collections import Counter
from urllib.parse import quote

import urllib.request
import urllib.error

# ─── Config ────────────────────────────────────────────────────────────────
# Read service role key from env var — NEVER hardcode it (GitHub Push
# Protection will block commits containing Supabase secrets).
SUPABASE_URL = "https://vxmxxoymiwpoaekgmigb.supabase.co"
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_API_KEY") or os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY"
)

if not SERVICE_ROLE_KEY:
    print(
        "ERROR: Set SUPABASE_API_KEY env var before running this script.\n"
        "  Example: SUPABASE_API_KEY=sb_secret_xxx python3 scripts/supabase-audit.py",
        file=sys.stderr,
    )
    sys.exit(1)

REST_BASE = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}


# ─── HTTP helpers ──────────────────────────────────────────────────────────
def http_get(url, extra_headers=None):
    """GET request with proper headers. Returns parsed JSON or None on error."""
    headers = dict(HEADERS)
    if extra_headers:
        headers.update(extra_headers)
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        return {"_http_error": e.code, "_error_body": err_body[:500]}
    except Exception as e:
        return {"_error": str(e)}


def http_head(url, extra_headers=None):
    """HEAD request — returns status code."""
    headers = dict(HEADERS)
    if extra_headers:
        headers.update(extra_headers)
    req = urllib.request.Request(url, headers=headers, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return -1


# ─── Tables we expect (from Prisma schema) ─────────────────────────────────
EXPECTED_TABLES = [
    "User",
    "Property",
    "SavedProperty",
    "SavedSearch",
    "Lead",
    "Appointment",
    "Message",
    "Notification",
    "CrmNote",
    "Commission",
    "NewsletterSubscriber",
    "ValuationRequest",
    "MortgageEnquiry",
    "Agent",
    "Community",
    "Developer",
    "BlogPost",
    "Testimonial",
    "Award",
    "SiteSetting",
    "AuditLog",
    "HeroSlide",
    "Location",
    "PropertyCategory",
    "Amenity",
    "ActivityLog",
    "MediaFile",
    "Popup",
    "SeoMeta",
    "MenuItem",
    "EmailTemplate",
    "LandingPage",
    "ReportSnapshot",
    "Faq",
    "Video",
    "StoryEvent",
]


def get_table_count(table):
    """Get row count for a table using the Prefer: count=exact header."""
    url = f"{REST_BASE}/{table}?select=*&limit=1"
    code = http_head(url, extra_headers={"Prefer": "count=exact", "Range": "0-0"})
    # If HEAD not supported, fall back to GET
    if code == -1 or code >= 400:
        result = http_get(url, extra_headers={"Prefer": "count=exact", "Range": "0-0"})
        if isinstance(result, list):
            # Try content-range from response... actually urllib doesn't expose that easily
            return len(result)
        return None
    # HEAD with count=exact returns Content-Range header
    # urllib hides headers — re-fetch and inspect
    req = urllib.request.Request(url, headers={**HEADERS, "Prefer": "count=exact", "Range": "0-0"}, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            cr = resp.headers.get("Content-Range", "")
            if "/" in cr:
                return int(cr.split("/")[-1])
    except Exception:
        pass
    return None


def get_rows(table, select="*", limit=100, order=None):
    """Fetch rows from a table."""
    url = f"{REST_BASE}/{table}?select={quote(select)}&limit={limit}"
    if order:
        url += f"&order={quote(order)}"
    return http_get(url)


# ─── Audit functions ───────────────────────────────────────────────────────
def audit_table_list():
    """Get row counts for all expected tables."""
    print("\n" + "=" * 72)
    print("  1. TABLE INVENTORY & ROW COUNTS")
    print("=" * 72)
    results = []
    for tbl in EXPECTED_TABLES:
        count = get_table_count(tbl)
        status = "✓" if count is not None else "✗"
        results.append((tbl, count, status))
        if count is None:
            print(f"  {status} {tbl:30s}  → table not accessible or doesn't exist")
        elif count == 0:
            print(f"  {status} {tbl:30s}  → 0 rows (empty)")
        else:
            print(f"  {status} {tbl:30s}  → {count:,} rows")
    return results


def audit_property_table():
    """Deep audit of the Property table."""
    print("\n" + "=" * 72)
    print("  2. PROPERTY TABLE — DEEP AUDIT")
    print("=" * 72)

    total = get_table_count("Property")
    published = get_table_count("Property?filter=published%3Deq.true")
    print(f"\n  Total properties:           {total or '?'}")
    print(f"  Published (published=true): {published or '?'}")

    # Fetch all published properties (up to 1000) for analysis
    rows = get_rows("Property", select="id,reference,title,community,subCommunity,agentId,images,amenities,features,price,status,reraNumber,published,createdAt", limit=1000, order="createdAt.desc")
    if not isinstance(rows, list):
        print(f"  ⚠ Could not fetch Property rows: {rows}")
        return None

    # Image analysis
    image_counts = []
    empty_image_count = 0
    duplicate_image_count = 0
    broken_image_refs = []
    all_image_urls = []

    for row in rows:
        raw = row.get("images")
        if not raw:
            empty_image_count += 1
            image_counts.append(0)
            continue
        try:
            imgs = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            imgs = []
        if not isinstance(imgs, list):
            imgs = []
        # De-dupe within the property
        unique = list(dict.fromkeys(imgs))
        if len(unique) < len(imgs):
            duplicate_image_count += 1
        image_counts.append(len(unique))
        all_image_urls.extend(unique)
        # Heuristic: empty string entries
        for u in imgs:
            if not u or not str(u).strip():
                broken_image_refs.append((row.get("reference"), "empty-string"))

    print(f"\n  Image analysis (published, sample of {len(rows)}):")
    print(f"    Properties with 0 images:        {empty_image_count}")
    print(f"    Properties with duplicate URLs:  {duplicate_image_count}")
    if image_counts:
        avg = sum(image_counts) / len(image_counts)
        mx = max(image_counts)
        mn = min(image_counts)
        print(f"    Avg images per property:         {avg:.1f}")
        print(f"    Min / Max images per property:   {mn} / {mx}")
        # Distribution
        dist = Counter(image_counts)
        print(f"    Distribution:")
        for n in sorted(dist.keys()):
            print(f"      {n:>3} images: {dist[n]:>3} properties")

    # Test/dummy record detection
    test_title_patterns = [
        r"^test\s+property",
        r"^test\s+-",
        r"fixed\s+submission",
        r"\bdummy\b",
        r"\bseed\b",
        r"^sample\s+",
    ]
    test_rera_patterns = [
        r"^RENT-TEST-",
        r"^SALE-TEST-",
        r"^TEST-",
        r"^DUMMY-",
    ]
    test_records = []
    for row in rows:
        title = (row.get("title") or "")
        rera = row.get("reraNumber") or ""
        if any(re.search(p, title, re.I) for p in test_title_patterns):
            test_records.append((row.get("reference"), "title", title))
        elif rera and any(re.search(p, rera, re.I) for p in test_rera_patterns):
            test_records.append((row.get("reference"), "rera", rera))
    print(f"\n  Test/dummy records detected (public API filters these out):")
    print(f"    Count: {len(test_records)}")
    for ref, kind, val in test_records[:10]:
        print(f"      {ref}  ({kind})  → {val[:60]}")
    if len(test_records) > 10:
        print(f"      ... and {len(test_records) - 10} more")

    # AgentId assignment
    with_agent = sum(1 for r in rows if r.get("agentId"))
    without_agent = sum(1 for r in rows if not r.get("agentId"))
    print(f"\n  Agent assignment:")
    print(f"    Properties WITH assigned agent (agentId set): {with_agent}")
    print(f"    Properties WITHOUT agent (agentId NULL):      {without_agent}")

    # Status distribution
    status_dist = Counter(r.get("status") for r in rows)
    print(f"\n  Status distribution:")
    for s, c in status_dist.most_common():
        print(f"    {s!s:20s}  {c}")

    # Community distribution (top 10)
    comm_dist = Counter(r.get("community") for r in rows if r.get("community"))
    print(f"\n  Top 10 communities:")
    for c, n in comm_dist.most_common(10):
        print(f"    {c!s:30s}  {n}")

    return {
        "total_published": len(rows),
        "empty_images": empty_image_count,
        "duplicate_images": duplicate_image_count,
        "test_records": len(test_records),
        "with_agent": with_agent,
        "without_agent": without_agent,
        "image_url_sample": all_image_urls[:5],
    }


def audit_agent_table():
    """Deep audit of the Agent table."""
    print("\n" + "=" * 72)
    print("  3. AGENT TABLE — COMPLETENESS AUDIT")
    print("=" * 72)

    total = get_table_count("Agent")
    published = get_table_count("Agent?filter=published%3Deq.true")
    print(f"\n  Total agents:           {total or '?'}")
    print(f"  Published agents:       {published or '?'}")

    rows = get_rows("Agent", select="id,name,title,photo,phone,whatsapp,email,activeListings,soldProperties,published", limit=100)
    if not isinstance(rows, list):
        print(f"  ⚠ Could not fetch Agent rows: {rows}")
        return

    missing_photo = sum(1 for r in rows if not r.get("photo"))
    missing_phone = sum(1 for r in rows if not r.get("phone"))
    missing_whatsapp = sum(1 for r in rows if not r.get("whatsapp"))
    missing_email = sum(1 for r in rows if not r.get("email"))
    missing_title = sum(1 for r in rows if not r.get("title"))

    print(f"\n  Field completeness (sample of {len(rows)} agents):")
    print(f"    Missing photo:      {missing_photo}")
    print(f"    Missing phone:      {missing_phone}")
    print(f"    Missing whatsapp:   {missing_whatsapp}")
    print(f"    Missing email:      {missing_email}")
    print(f"    Missing title:      {missing_title}")

    print(f"\n  Agent roster:")
    for r in rows[:15]:
        name = r.get("name", "?")
        title = r.get("title", "?")
        photo = "📷" if r.get("photo") else "❌"
        phone = "📞" if r.get("phone") else "❌"
        wa = "💬" if r.get("whatsapp") else "❌"
        listings = r.get("activeListings", 0)
        print(f"    {photo}{phone}{wa}  {name:30s}  ({title})  listings={listings}")
    if len(rows) > 15:
        print(f"    ... and {len(rows) - 15} more")


def audit_property_agent_relationship():
    """Validate Property → User → Agent relationship via email match."""
    print("\n" + "=" * 72)
    print("  4. PROPERTY ↔ USER ↔ AGENT RELATIONSHIP INTEGRITY")
    print("=" * 72)

    # Get properties with agentId
    props = get_rows("Property", select="id,reference,agentId", limit=1000)
    if not isinstance(props, list):
        print(f"  ⚠ Could not fetch Properties: {props}")
        return

    agent_ids = list({r["agentId"] for r in props if r.get("agentId")})
    print(f"\n  Properties with agentId:  {sum(1 for r in props if r.get('agentId'))}")
    print(f"  Unique assigned User IDs: {len(agent_ids)}")

    # Fetch those User records
    user_emails = {}
    for uid in agent_ids[:50]:  # limit to 50 for speed
        u = http_get(f"{REST_BASE}/User?id=eq.{quote(uid)}&select=id,name,email,phone,avatarUrl,role&limit=1")
        if isinstance(u, list) and u:
            user_emails[uid] = u[0].get("email")
            print(f"    User {uid[:12]}... → email={u[0].get('email')!r}  name={u[0].get('name')!r}  role={u[0].get('role')!r}")

    # Now check if Agent records exist for these emails
    if not user_emails:
        print("\n  ⚠ No User emails found — cannot validate Agent profile linkage.")
        return

    print(f"\n  Matching Agent profiles by email:")
    agents = get_rows("Agent", select="id,name,email,title,phone,whatsapp,photo", limit=100)
    if not isinstance(agents, list):
        print(f"  ⚠ Could not fetch Agents: {agents}")
        return

    agent_email_map = {a.get("email"): a for a in agents if a.get("email")}
    matched = 0
    unmatched = 0
    for uid, email in user_emails.items():
        if email and email in agent_email_map:
            matched += 1
            a = agent_email_map[email]
            print(f"    ✓ {email}  →  Agent: {a.get('name')} ({a.get('title')})")
        else:
            unmatched += 1
            print(f"    ✗ {email}  →  NO matching Agent profile record")

    print(f"\n  Summary:")
    print(f"    Property → User (auth):        {sum(1 for r in props if r.get('agentId'))} properties linked")
    print(f"    User emails resolved:          {len(user_emails)}")
    print(f"    User → Agent profile (matched): {matched}")
    print(f"    User → Agent profile (MISSING): {unmatched}")

    if unmatched > 0:
        print(f"\n  ⚠ {unmatched} assigned Users have no Agent profile record.")
        print(f"    These properties will fall back to User fields (avatarUrl, phone)")
        print(f"    instead of rich Agent profile (title, whatsapp, specializations).")


def audit_other_tables():
    """Quick audit of other key tables."""
    print("\n" + "=" * 72)
    print("  5. OTHER KEY TABLES — QUICK AUDIT")
    print("=" * 72)

    tables = [
        ("Community", "id,name,shortName,hero,published,totalProperties,rating"),
        ("Developer", "id,name,logo,founded,totalProjects,published"),
        ("BlogPost", "id,title,category,published,createdAt"),
        ("Testimonial", "id,name,rating,published"),
        ("HeroSlide", "id,heading1,heading2,order,published"),
        ("Faq", "id,question,category,published"),
        ("Video", "id,title,advisor,category,published"),
        ("MenuItem", "id,label,menu,visible,order"),
        ("SiteSetting", "id,key,value,category"),
        ("Lead", "id,name,status,source,createdAt"),
        ("NewsletterSubscriber", "id,email,createdAt"),
    ]
    for tbl, select in tables:
        count = get_table_count(tbl)
        if not count:
            print(f"\n  {tbl}: 0 rows or inaccessible")
            continue
        rows = get_rows(tbl, select=select, limit=3)
        print(f"\n  {tbl}: {count} rows  (showing first 3)")
        if isinstance(rows, list):
            for r in rows[:3]:
                # Truncate long fields
                slim = {k: (str(v)[:50] + "…" if v and len(str(v)) > 50 else v) for k, v in r.items()}
                print(f"    {slim}")


def audit_image_quality():
    """Spot-check image URLs by HEADing them."""
    print("\n" + "=" * 72)
    print("  6. IMAGE URL SPOT-CHECK (HEAD requests on first 10 URLs)")
    print("=" * 72)

    props = get_rows("Property", select="reference,images", limit=50, order="createdAt.desc")
    if not isinstance(props, list):
        print(f"  ⚠ Could not fetch properties for image check: {props}")
        return

    checked = 0
    broken = 0
    for p in props:
        if checked >= 10:
            break
        raw = p.get("images")
        if not raw:
            continue
        try:
            imgs = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            continue
        if not imgs:
            continue
        url = imgs[0]
        if not url:
            continue
        # HEAD the URL (no auth headers for public URLs)
        try:
            req = urllib.request.Request(url, method="HEAD")
            with urllib.request.urlopen(req, timeout=10) as resp:
                status = resp.status
                ct = resp.headers.get("Content-Type", "?")
                cl = resp.headers.get("Content-Length", "?")
        except urllib.error.HTTPError as e:
            status = e.code
            ct = "?"
            cl = "?"
            broken += 1
        except Exception as e:
            status = -1
            ct = str(e)[:30]
            cl = "?"
            broken += 1
        print(f"    {p['reference']:20s} → HTTP {status}  type={ct}  size={cl}")
        checked += 1

    print(f"\n  Checked: {checked}, Broken/unreachable: {broken}")


def audit_recommendations(prop_audit):
    """Final recommendations based on audit findings."""
    print("\n" + "=" * 72)
    print("  7. RECOMMENDATIONS")
    print("=" * 72)

    if not prop_audit:
        print("  (skipped — property audit failed)")
        return

    recs = []
    if prop_audit["empty_images"] > 0:
        recs.append(
            f"⚠ {prop_audit['empty_images']} published properties have 0 images. "
            "These will show 'No images available' on the detail page."
        )
    if prop_audit["duplicate_images"] > 0:
        recs.append(
            f"⚠ {prop_audit['duplicate_images']} properties have duplicate image URLs in their `images` array. "
            "The PropertyGallery component already de-dupes these at render time, "
            "but you should clean them at source via an admin SQL update."
        )
    if prop_audit["test_records"] > 0:
        recs.append(
            f"ℹ {prop_audit['test_records']} test/dummy records still exist in the DB. "
            "Public API already filters them via regex, but consider deleting them permanently: "
            "DELETE FROM \"Property\" WHERE title ~* '^test' OR \"reraNumber\" ~* '^RENT-TEST-';"
        )
    if prop_audit["without_agent"] > 0:
        recs.append(
            f"⚠ {prop_audit['without_agent']} published properties have no assigned agent (agentId IS NULL). "
            "These will show the generic 'Royal Jubilant Team' fallback on the detail page. "
            "Assign agents via the admin panel."
        )
    if not recs:
        recs.append("✓ No critical issues detected.")

    for r in recs:
        print(f"\n  {r}")


# ─── Main ──────────────────────────────────────────────────────────────────
def main():
    print("=" * 72)
    print("  ROYAL JUBILANT REAL ESTATE — SUPABASE DATABASE AUDIT")
    print(f"  Project: {SUPABASE_URL}")
    print("=" * 72)

    # Quick auth test
    test = http_get(f"{REST_BASE}/Property?select=id&limit=1")
    if isinstance(test, dict) and test.get("_http_error"):
        print(f"\n  ✗ Auth failed: HTTP {test['_http_error']}")
        print(f"    Response: {test.get('_error_body', '')[:300]}")
        sys.exit(1)
    elif isinstance(test, list):
        print(f"\n  ✓ Service role key works. Connected to REST API.")
    else:
        print(f"\n  ⚠ Unexpected response: {test}")
        sys.exit(1)

    audit_table_list()
    prop_audit = audit_property_table()
    audit_agent_table()
    audit_property_agent_relationship()
    audit_other_tables()
    audit_image_quality()
    audit_recommendations(prop_audit)

    print("\n" + "=" * 72)
    print("  AUDIT COMPLETE")
    print("=" * 72)


if __name__ == "__main__":
    main()
