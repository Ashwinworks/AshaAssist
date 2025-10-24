"""
Helper script to convert Firebase credentials JSON to base64
for use in Vercel environment variables
"""
import base64
import json
import os
import sys

def encode_firebase_credentials(input_file):
    """
    Encode Firebase credentials JSON file to base64
    
    Args:
        input_file: Path to Firebase credentials JSON file
    """
    try:
        # Check if file exists
        if not os.path.exists(input_file):
            print(f"Error: File not found: {input_file}")
            sys.exit(1)
        
        # Read the JSON file
        print(f"Reading Firebase credentials from: {input_file}")
        with open(input_file, 'r') as f:
            credentials = json.load(f)
        
        # Validate it's a proper Firebase credentials file
        required_fields = ['type', 'project_id', 'private_key', 'client_email']
        missing_fields = [field for field in required_fields if field not in credentials]
        
        if missing_fields:
            print(f"Warning: Missing fields in credentials: {missing_fields}")
            print("This might not be a valid Firebase service account file.")
            response = input("Continue anyway? (y/n): ")
            if response.lower() != 'y':
                sys.exit(1)
        
        # Convert to JSON string (compact, no extra whitespace)
        json_str = json.dumps(credentials, separators=(',', ':'))
        
        # Encode to base64
        base64_encoded = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')
        
        print("\n" + "="*80)
        print("SUCCESS! Firebase credentials encoded to base64")
        print("="*80)
        print("\nBase64 Encoded Credentials:")
        print("-"*80)
        print(base64_encoded)
        print("-"*80)
        
        print("\n📋 NEXT STEPS:")
        print("1. Copy the base64 string above")
        print("2. Go to Vercel Dashboard > Your Project > Settings > Environment Variables")
        print("3. Add a new environment variable:")
        print("   - Name: FIREBASE_CREDENTIALS_JSON")
        print("   - Value: [paste the base64 string]")
        print("   - Environments: Production, Preview, Development (select all)")
        print("4. Save and redeploy your application")
        print("\nOr use Vercel CLI:")
        print("   vercel env add FIREBASE_CREDENTIALS_JSON")
        print("   (then paste the base64 string when prompted)")
        
        # Optionally save to file
        print("\n" + "="*80)
        save = input("\nDo you want to save this to a file? (y/n): ")
        if save.lower() == 'y':
            output_file = input("Enter output filename (default: firebase_base64.txt): ").strip()
            if not output_file:
                output_file = "firebase_base64.txt"
            
            with open(output_file, 'w') as f:
                f.write(base64_encoded)
            
            print(f"\n✅ Base64 credentials saved to: {output_file}")
            print("⚠️  IMPORTANT: Do NOT commit this file to Git!")
            print("   Add it to .gitignore if you haven't already")
        
        print("\n" + "="*80)
        print("✨ Encoding complete!")
        print("="*80 + "\n")
        
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

def main():
    print("="*80)
    print("Firebase Credentials to Base64 Encoder")
    print("="*80 + "\n")
    
    # Get input file path
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    else:
        print("Usage: python encode_firebase_credentials.py <path-to-firebase-json>")
        print("\nOr enter the path now:")
        input_file = input("Path to Firebase credentials JSON file: ").strip()
        
        if not input_file:
            print("Error: No file path provided")
            sys.exit(1)
    
    # Remove quotes if user copied path with quotes
    input_file = input_file.strip('"').strip("'")
    
    encode_firebase_credentials(input_file)

if __name__ == "__main__":
    main()
