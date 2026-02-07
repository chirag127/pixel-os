"""
Vercel Deployment Script
Deploys Pixel OS to Vercel
"""

import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
VERCEL_TOKEN = os.getenv("VERCEL_TOKEN")
VERCEL_ORG_ID = os.getenv("VERCEL_ORG_ID")
VERCEL_PROJECT_ID = os.getenv("VERCEL_PROJECT_ID")
DIST_DIR = "dist"
TIMEOUT = 300


def run_command(cmd: list[str], cwd: str = None, timeout: int = TIMEOUT) -> tuple[bool, str]:
    """Run a command and return success status and output."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=True if sys.platform == "win32" else False
        )
        output = result.stdout + result.stderr
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        return False, f"Command timed out after {timeout}s"
    except Exception as e:
        return False, str(e)


def build_project() -> bool:
    """Build the project."""
    print("📦 Building project...")
    project_root = Path(__file__).parent.parent
    success, output = run_command(["npm", "run", "build"], cwd=str(project_root))
    if success:
        print("✅ Build successful")
    else:
        print(f"❌ Build failed: {output}")
    return success


def deploy_to_vercel() -> bool:
    """Deploy to Vercel."""
    print("🚀 Deploying to Vercel...")

    project_root = Path(__file__).parent.parent
    dist_path = project_root / DIST_DIR

    if not dist_path.exists():
        print(f"❌ Dist directory not found: {dist_path}")
        return False

    env = os.environ.copy()
    env["VERCEL_TOKEN"] = VERCEL_TOKEN or ""
    env["VERCEL_ORG_ID"] = VERCEL_ORG_ID or ""
    env["VERCEL_PROJECT_ID"] = VERCEL_PROJECT_ID or ""

    # Deploy using Vercel CLI
    cmd = [
        "npx", "vercel", "--prod",
        "--token", VERCEL_TOKEN or "",
        "--yes"
    ]

    success, output = run_command(cmd, cwd=str(project_root), timeout=TIMEOUT)

    if success:
        print("✅ Deployment successful!")
        if "https://" in output:
            for line in output.split("\n"):
                if "https://" in line and "vercel" in line.lower():
                    print(f"🌐 URL: {line.strip()}")
    else:
        print(f"❌ Deployment failed: {output}")

    return success


def main():
    """Main deployment function."""
    print("=" * 60)
    print("🔷 Vercel Deployment")
    print("=" * 60)

    if not VERCEL_TOKEN:
        print("❌ Missing VERCEL_TOKEN")
        return False

    if not build_project():
        return False

    if not deploy_to_vercel():
        return False

    print("\n" + "=" * 60)
    print("✅ Vercel deployment complete!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
