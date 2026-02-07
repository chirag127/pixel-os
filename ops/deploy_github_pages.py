"""
GitHub Pages Deployment Script
Deploys Pixel OS to GitHub Pages
"""

import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
GH_USERNAME = os.getenv("GH_USERNAME", "chirag127")
GH_TOKEN = os.getenv("GH_TOKEN")
REPO_NAME = "pixel-os"
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


def deploy_to_github_pages() -> bool:
    """Deploy to GitHub Pages using gh-pages."""
    print("🚀 Deploying to GitHub Pages...")

    project_root = Path(__file__).parent.parent
    dist_path = project_root / DIST_DIR

    if not dist_path.exists():
        print(f"❌ Dist directory not found: {dist_path}")
        return False

    # Add CNAME file if needed (optional)
    # cname_file = dist_path / "CNAME"
    # cname_file.write_text("img.oriz.in")

    # Add .nojekyll for proper asset handling
    nojekyll = dist_path / ".nojekyll"
    nojekyll.touch()

    # Copy index.html to 404.html for SPA routing
    index_file = dist_path / "index.html"
    not_found_file = dist_path / "404.html"
    if index_file.exists():
        not_found_file.write_text(index_file.read_text())

    # Deploy using gh-pages
    cmd = ["npx", "gh-pages", "-d", str(dist_path)]

    success, output = run_command(cmd, cwd=str(project_root))

    if success:
        print("✅ Deployment successful!")
        print(f"🌐 URL: https://{GH_USERNAME}.github.io/{REPO_NAME}")
    else:
        print(f"❌ Deployment failed: {output}")

    return success


def main():
    """Main deployment function."""
    print("=" * 60)
    print("🔷 GitHub Pages Deployment")
    print("=" * 60)

    if not build_project():
        return False

    if not deploy_to_github_pages():
        return False

    print("\n" + "=" * 60)
    print("✅ GitHub Pages deployment complete!")
    print(f"🌐 Live at: https://{GH_USERNAME}.github.io/{REPO_NAME}")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
