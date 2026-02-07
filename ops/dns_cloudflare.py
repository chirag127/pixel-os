"""
Cloudflare DNS Management Script
Manages DNS records for pixel-os domains
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
CLOUDFLARE_API_TOKEN = os.getenv("CLOUDFLARE_GLOBAL_API_KEY")
CLOUDFLARE_EMAIL = os.getenv("CLOUDFLARE_EMAIL")
CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")

# DNS Configuration
DNS_RECORDS = [
    {
        "zone_name": "oriz.in",
        "records": [
            {"type": "CNAME", "name": "img", "content": "pixel-os.pages.dev", "proxied": True},
        ]
    }
]

API_BASE = "https://api.cloudflare.com/client/v4"


def get_headers():
    """Get API headers."""
    return {
        "X-Auth-Email": CLOUDFLARE_EMAIL,
        "X-Auth-Key": CLOUDFLARE_API_TOKEN,
        "Content-Type": "application/json"
    }


def get_zone_id(zone_name: str) -> str | None:
    """Get zone ID by name."""
    url = f"{API_BASE}/zones?name={zone_name}"
    response = requests.get(url, headers=get_headers())

    if response.status_code == 200:
        data = response.json()
        if data["result"]:
            return data["result"][0]["id"]
    return None


def get_existing_record(zone_id: str, record_type: str, record_name: str) -> dict | None:
    """Get existing DNS record."""
    url = f"{API_BASE}/zones/{zone_id}/dns_records?type={record_type}&name={record_name}"
    response = requests.get(url, headers=get_headers())

    if response.status_code == 200:
        data = response.json()
        if data["result"]:
            return data["result"][0]
    return None


def create_or_update_record(zone_id: str, record: dict, zone_name: str) -> bool:
    """Create or update a DNS record."""
    full_name = f"{record['name']}.{zone_name}" if record['name'] != '@' else zone_name

    existing = get_existing_record(zone_id, record["type"], full_name)

    payload = {
        "type": record["type"],
        "name": record["name"],
        "content": record["content"],
        "proxied": record.get("proxied", False),
        "ttl": record.get("ttl", 1)  # 1 = auto
    }

    if existing:
        # Update
        url = f"{API_BASE}/zones/{zone_id}/dns_records/{existing['id']}"
        response = requests.put(url, headers=get_headers(), json=payload)
        action = "Updated"
    else:
        # Create
        url = f"{API_BASE}/zones/{zone_id}/dns_records"
        response = requests.post(url, headers=get_headers(), json=payload)
        action = "Created"

    if response.status_code in [200, 201]:
        print(f"  ✅ {action}: {record['type']} {record['name']} -> {record['content']}")
        return True
    else:
        print(f"  ❌ Failed: {response.json()}")
        return False


def main():
    """Main DNS management function."""
    print("=" * 60)
    print("🔷 Cloudflare DNS Management")
    print("=" * 60)

    if not CLOUDFLARE_API_TOKEN or not CLOUDFLARE_EMAIL:
        print("❌ Missing Cloudflare credentials")
        return False

    success_count = 0
    total_count = 0

    for zone_config in DNS_RECORDS:
        zone_name = zone_config["zone_name"]
        print(f"\n📍 Zone: {zone_name}")

        zone_id = get_zone_id(zone_name)
        if not zone_id:
            print(f"  ❌ Zone not found: {zone_name}")
            continue

        for record in zone_config["records"]:
            total_count += 1
            if create_or_update_record(zone_id, record, zone_name):
                success_count += 1

    print("\n" + "=" * 60)
    print(f"✅ DNS Records: {success_count}/{total_count} successful")
    print("=" * 60)

    return success_count == total_count


if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
