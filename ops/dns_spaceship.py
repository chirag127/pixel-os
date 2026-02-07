"""
Spaceship DNS Management Script
Manages nameserver configuration via Spaceship API
"""

import os
import requests
import hashlib
import hmac
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SPACESHIP_API_KEY = os.getenv("SPACESHIP_API_KEY")
SPACESHIP_API_SECRET = os.getenv("SPACESHIP_API_SECRET")
SPACESHIP_API_URL = os.getenv("SPACESHIP_API_URL", "https://spaceship.dev/api/v1")

# Cloudflare nameservers
CLOUDFLARE_NS = [
    "howard.ns.cloudflare.com",
    "sierra.ns.cloudflare.com"
]


def get_auth_headers():
    """Generate authentication headers for Spaceship API."""
    timestamp = str(int(time.time()))
    signature = hmac.new(
        SPACESHIP_API_SECRET.encode(),
        f"{SPACESHIP_API_KEY}{timestamp}".encode(),
        hashlib.sha256
    ).hexdigest()

    return {
        "X-Api-Key": SPACESHIP_API_KEY,
        "X-Timestamp": timestamp,
        "X-Signature": signature,
        "Content-Type": "application/json"
    }


def get_domain_info(domain: str) -> dict | None:
    """Get domain information."""
    url = f"{SPACESHIP_API_URL}/domains/{domain}"

    try:
        response = requests.get(url, headers=get_auth_headers(), timeout=30)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error: {e}")

    return None


def update_nameservers(domain: str, nameservers: list) -> bool:
    """Update domain nameservers."""
    url = f"{SPACESHIP_API_URL}/domains/{domain}/nameservers"

    payload = {"nameservers": nameservers}

    try:
        response = requests.put(url, headers=get_auth_headers(), json=payload, timeout=30)
        if response.status_code in [200, 201, 204]:
            return True
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error: {e}")

    return False


def main():
    """Main function to update nameservers."""
    print("=" * 60)
    print("🔷 Spaceship DNS Management")
    print("=" * 60)

    if not SPACESHIP_API_KEY or not SPACESHIP_API_SECRET:
        print("❌ Missing Spaceship API credentials")
        return False

    domain = "oriz.in"
    print(f"\n📍 Domain: {domain}")
    print(f"🎯 Target Nameservers: {', '.join(CLOUDFLARE_NS)}")

    # Get current info
    info = get_domain_info(domain)
    if info:
        current_ns = info.get("nameservers", [])
        print(f"📋 Current Nameservers: {', '.join(current_ns)}")

        if set(current_ns) == set(CLOUDFLARE_NS):
            print("✅ Nameservers already configured correctly!")
            return True

    # Update nameservers
    print("\n🔄 Updating nameservers...")
    if update_nameservers(domain, CLOUDFLARE_NS):
        print("✅ Nameservers updated successfully!")
        return True
    else:
        print("❌ Failed to update nameservers")
        return False


if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
