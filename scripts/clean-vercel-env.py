#!/usr/bin/env python3
"""
Clean Vercel environment variables by removing newlines and whitespace.

This script helps you update Vercel environment variables that have
trailing newlines or other whitespace characters that can cause
authentication failures.

Usage:
    python3 scripts/clean-vercel-env.py
"""

import subprocess
import sys
import getpass
from typing import List, Tuple


# Environment variables to clean
ENV_VARS = [
    "SQUARE_PRODUCTION_ACCESS_TOKEN",
    "SQUARE_PRODUCTION_APPLICATION_ID",
    "SQUARE_PRODUCTION_LOCATION_ID",
    "NEXT_PUBLIC_SQUARE_PRODUCTION_APPLICATION_ID",
    "NEXT_PUBLIC_SQUARE_PRODUCTION_LOCATION_ID",
    "SQUARE_SANDBOX_ACCESS_TOKEN",
    "SQUARE_SANDBOX_APPLICATION_ID",
    "SQUARE_SANDBOX_LOCATION_ID",
    "NEXT_PUBLIC_SQUARE_SANDBOX_APPLICATION_ID",
    "NEXT_PUBLIC_SQUARE_SANDBOX_LOCATION_ID",
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
]


def clean_value(value: str) -> str:
    """Remove newlines, carriage returns, and trailing whitespace."""
    return value.strip().replace('\n', '').replace('\r', '')


def update_env_var(var_name: str, value: str) -> bool:
    """Update a Vercel environment variable."""
    try:
        # Remove old value
        print(f"  Removing old value...")
        subprocess.run(
            ["vercel", "env", "rm", var_name, "production", "--yes"],
            capture_output=True,
            text=True
        )

        # Add new cleaned value
        print(f"  Adding cleaned value...")
        result = subprocess.run(
            ["vercel", "env", "add", var_name, "production"],
            input=value,
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print(f"  ✅ Successfully updated {var_name}")
            return True
        else:
            print(f"  ❌ Failed to update {var_name}: {result.stderr}")
            return False

    except Exception as e:
        print(f"  ❌ Error updating {var_name}: {str(e)}")
        return False


def main():
    print("🧹 Vercel Environment Variable Cleanup")
    print("=" * 60)
    print()
    print("This script will help you remove trailing newlines and")
    print("whitespace from Vercel environment variables.")
    print()
    print("Environment variables to clean:")
    for var in ENV_VARS:
        print(f"  • {var}")
    print()

    response = input("Do you want to continue? (y/n): ")
    if response.lower() != 'y':
        print("Aborted.")
        return

    print()
    print("For each variable, paste the value when prompted.")
    print("The script will automatically strip newlines and whitespace.")
    print()

    updated = []
    skipped = []

    for var in ENV_VARS:
        print("─" * 60)
        print(f"Variable: {var}")
        print("─" * 60)

        response = input(f"Update {var}? (y/n/skip): ").lower()

        if response == 'skip' or response == 's':
            print(f"⏭️  Skipping {var}")
            skipped.append(var)
            print()
            continue

        if response != 'y':
            print(f"⏭️  Skipping {var}")
            skipped.append(var)
            print()
            continue

        # Get the value (hidden input)
        raw_value = getpass.getpass(f"Enter value for {var} (hidden): ")

        # Clean the value
        cleaned_value = clean_value(raw_value)

        if not cleaned_value:
            print("⚠️  Empty value detected. Skipping.")
            skipped.append(var)
            print()
            continue

        # Show preview
        print(f"  Length: {len(cleaned_value)} characters")
        if len(cleaned_value) > 20:
            print(f"  Preview: {cleaned_value[:10]}...{cleaned_value[-10:]}")
        else:
            print(f"  Preview: {cleaned_value[:5]}...{cleaned_value[-5:]}")

        confirm = input("  Does this look correct? (y/n): ")
        if confirm.lower() != 'y':
            print("⏭️  Skipping")
            skipped.append(var)
            print()
            continue

        # Update the variable
        if update_env_var(var, cleaned_value):
            updated.append(var)
        else:
            skipped.append(var)

        print()

    # Summary
    print()
    print("=" * 60)
    print("✨ Cleanup Summary")
    print("=" * 60)
    print(f"✅ Updated: {len(updated)} variables")
    for var in updated:
        print(f"   • {var}")

    if skipped:
        print(f"\n⏭️  Skipped: {len(skipped)} variables")
        for var in skipped:
            print(f"   • {var}")

    if updated:
        print()
        print("Next steps:")
        print("1. Pull the updated values: vercel env pull .env.local")
        print("2. Deploy to production: vercel --prod")
        print("3. Test the checkout flow")

    print()


if __name__ == "__main__":
    main()
