"""
Service for seeding default data and health blogs
"""
from datetime import datetime, timezone
from bson import ObjectId
from utils.svg_generator import generate_svg_banner, slugify

class SeedService:
    def __init__(self, collections):
        self.collections = collections

    def create_default_health_blogs(self):
        """Create default general health blogs on startup"""
        try:
            # Only seed if collection is empty or missing our demo entries
            existing_count = self.collections['health_blogs'].count_documents({})

            demo_titles = [
                "Understanding Vaccination Schedules",
                "Tips for Maternal Health: Prenatal to Postnatal",
                "Managing Chronic Conditions at Home",
                "Child Nutrition Basics for Growing Kids",
                "Monsoon Health Tips: Preventing Common Illnesses"
            ]
            existing_titles = set(
                doc.get('title') for doc in self.collections['health_blogs'].find({
                    'title': { '$in': demo_titles }
                }, { 'title': 1 })
            )

            # Resolve a creator user (prefer admin, else ASHA, else any user)
            creator = (
                self.collections['users'].find_one({'email': 'admin@example.com'}) or
                self.collections['users'].find_one({'email': 'asha@gmail.com'}) or
                self.collections['users'].find_one({})
            )
            if not creator:
                # No users available; skip seeding safely
                print("No users found; skipping demo health blog seeding.")
                return

            creator_id = creator['_id']
            now = datetime.now(timezone.utc)

            demo_docs = []
            # Seed if empty or missing individual demo documents
            items = [
                (
                    "Understanding Vaccination Schedules",
                    "Learn the basics of vaccination timelines, why booster doses matter, common vaccines for children and adults, and how to use reminders to stay on track. We also cover what to do if you miss a dose and how to consult your nearest health center.",
                    "Timely vaccines protect your family and the community by preventing outbreaks. Keep your records handy and set reminders for upcoming doses."
                ),
                (
                    "Tips for Maternal Health: Prenatal to Postnatal",
                    "From the first trimester to postnatal recovery: practical nutrition tips, safe daily activity, warning signs to watch for, and when to seek medical care. Includes breastfeeding basics and mental well-being resources.",
                    "Good rest, hydration, and social support help recovery. Seek immediate care for heavy bleeding, severe headaches, or high fever."
                ),
                (
                    "Managing Chronic Conditions at Home",
                    "Build a simple routine for monitoring blood pressure and glucose, keep a medicine log, recognize red flags, and maintain regular follow-ups. Learn how diet, hydration, and sleep together support long-term control.",
                    "Small daily habits make the biggest difference. Record readings, don't skip doses, and walk at least 20–30 minutes most days."
                ),
                (
                    "Child Nutrition Basics for Growing Kids",
                    "Balanced plates for different age groups, protein and iron-rich options, healthy snack swaps, and signs of common deficiencies. Tips to handle picky eating while keeping meals fun and nutritious.",
                    "Offer colorful variety. Limit sugary drinks. Involve kids in simple meal prep to build healthy interest in food."
                ),
                (
                    "Monsoon Health Tips: Preventing Common Illnesses",
                    "Keep drinking water safe, prevent mosquito bites, and manage minor fevers at home. Know when to visit a clinic, and how to maintain household hygiene during the rainy season.",
                    "Use covered containers, change stagnant water, and sleep under nets. Wash hands frequently to break infection chains."
                ),
            ]

            for title, content1, content2 in items:
                if existing_count == 0 or title not in existing_titles:
                    # Generate a unique SVG banner per blog
                    fname = f"{slugify(title)}.svg"
                    subtitle = "General Health Guidance"
                    # Pick a color scheme per item for variety
                    schemes = [
                        ("#0ea5e9", "#22d3ee"),
                        ("#10b981", "#34d399"),
                        ("#6366f1", "#a78bfa"),
                        ("#ef4444", "#f97316"),
                        ("#14b8a6", "#06b6d4"),
                    ]
                    idx = abs(hash(title)) % len(schemes)
                    bg, accent = schemes[idx]
                    img_url = generate_svg_banner(title, subtitle, fname, bg=bg, accent=accent) or None

                    demo_docs.append({
                        'title': title,
                        'content': f"{content1}\n\n{content2}",
                        'category': 'general',
                        'authorName': 'AshaAssist Team',
                        'imageUrl': img_url,
                        'status': 'published',  # visible to all users
                        'createdBy': ObjectId(creator_id),
                        'createdAt': now,
                        'updatedAt': now,
                        'views': 0,
                        'likes': 0,
                        'tags': ['general', 'health']
                    })

            if demo_docs:
                self.collections['health_blogs'].insert_many(demo_docs)
                print(f"✓ Seeded {len(demo_docs)} demo general health blogs.")
            else:
                print("Demo health blogs already present; no seeding needed.")
        except Exception as e:
            print(f"Error seeding demo health blogs: {e}")

    def create_sample_supply_requests(self):
        """Create sample supply requests for testing"""
        try:
            # Check if we already have sample requests
            existing_count = self.collections['supply_requests'].count_documents({})
            if existing_count > 0:
                print("Sample supply requests already exist; skipping seeding.")
                return

            # Get some sample users
            users = list(self.collections['users'].find({}, {'_id': 1, 'name': 1, 'beneficiaryCategory': 1}).limit(4))
            if len(users) < 2:
                print("Not enough users for sample supply requests; skipping seeding.")
                return

            now = datetime.now(timezone.utc)

            sample_requests = [
                {
                    'userId': users[0]['_id'],
                    'supplyName': 'Amrutham Podi',
                    'description': 'Need Amrutham Podi for my baby as prescribed by the doctor.',
                    'category': 'maternity',
                    'proofFile': '/uploads/sample_proof.pdf',
                    'status': 'pending',
                    'createdAt': now,
                    'updatedAt': now
                },
                {
                    'userId': users[0]['_id'],
                    'supplyName': 'Diapers',
                    'description': 'Requesting baby diapers for newborn care.',
                    'category': 'maternity',
                    'proofFile': '/uploads/sample_proof.pdf',
                    'status': 'approved',
                    'createdAt': now,
                    'updatedAt': now,
                    'reviewedBy': users[1]['_id'] if len(users) > 1 else None,
                    'reviewNotes': 'Approved based on medical certificate.'
                },
                {
                    'userId': users[1]['_id'] if len(users) > 1 else users[0]['_id'],
                    'supplyName': 'Adult diapers',
                    'description': 'Need adult diapers for palliative care patient.',
                    'category': 'palliative',
                    'proofFile': '/uploads/sample_proof.pdf',
                    'status': 'pending',
                    'createdAt': now,
                    'updatedAt': now
                },
                {
                    'userId': users[1]['_id'] if len(users) > 1 else users[0]['_id'],
                    'supplyName': 'BP Monitor',
                    'description': 'Blood pressure monitoring kit needed for regular check-ups.',
                    'category': 'palliative',
                    'proofFile': '/uploads/sample_proof.pdf',
                    'status': 'rejected',
                    'createdAt': now,
                    'updatedAt': now,
                    'reviewedBy': users[0]['_id'],
                    'reviewNotes': 'Insufficient medical documentation provided.'
                }
            ]

            self.collections['supply_requests'].insert_many(sample_requests)
            print(f"✓ Seeded {len(sample_requests)} sample supply requests.")
        except Exception as e:
            print(f"Error seeding sample supply requests: {e}")

    def create_default_locations(self):
        """Create default locations for ward1"""
        try:
            # Only seed if collection is empty
            existing_count = self.collections['locations'].count_documents({})
            if existing_count > 0:
                print("Locations already exist; skipping seeding.")
                return

            now = datetime.now(timezone.utc)

            default_locations = [
                {
                    'name': 'Manarcad Health Center (HC)',
                    'type': 'Health Center',
                    'ward': 'Ward 1',
                    'address': 'Manarcad, Ward 1',
                    'active': True,
                    'createdAt': now,
                    'updatedAt': now
                },
                {
                    'name': 'Pampady Health Center (HC)',
                    'type': 'Health Center',
                    'ward': 'Ward 1',
                    'address': 'Pampady, Ward 1',
                    'active': True,
                    'createdAt': now,
                    'updatedAt': now
                },
                {
                    'name': 'Anganvaadi Ward 1',
                    'type': 'Anganvaadi',
                    'ward': 'Ward 1',
                    'address': 'Anganvaadi Center, Ward 1',
                    'active': True,
                    'createdAt': now,
                    'updatedAt': now
                },
                {
                    'name': 'Community Hall Ward 1',
                    'type': 'Community Hall',
                    'ward': 'Ward 1',
                    'address': 'Community Hall, Ward 1',
                    'active': True,
                    'createdAt': now,
                    'updatedAt': now
                },
                {
                    'name': 'Homeo Clinic Ward 1',
                    'type': 'Clinic',
                    'ward': 'Ward 1',
                    'address': 'Homeo Clinic, Ward 1',
                    'active': True,
                    'createdAt': now,
                    'updatedAt': now
                }
            ]

            self.collections['locations'].insert_many(default_locations)
            print(f"✓ Seeded {len(default_locations)} default locations for Ward 1.")
        except Exception as e:
            print(f"Error seeding default locations: {e}")
