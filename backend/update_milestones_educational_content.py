"""
Script to update existing milestones with educational content
Run this once to add educational fields to milestones already in the database
"""
from config.database import get_database, get_collections
from datetime import datetime, timezone

def update_milestones_with_educational_content():
    """Update existing milestones with educational fields"""
    print("Connecting to database...")
    db = get_database()
    collections = get_collections(db)
    milestones_collection = collections['developmental_milestones']
    
    # Updated milestone data with educational content
    updates = [
        {
            'milestoneName': 'Holds head up',
            'data': {
                'checklistItems': [
                    'Lifts head 45 degrees during tummy time',
                    'Holds head steady when held upright',
                    'Turns head side to side while on back',
                    'Makes smooth movements with head'
                ],
                'videoUrl': 'https://www.youtube.com/embed/qGW0NbbGjsI',
                'tips': [
                    'Practice tummy time for 3-5 minutes, 2-3 times daily',
                    'Place colorful toys at eye level to encourage head lifting',
                    'Talk to baby from different positions to encourage head turning',
                    'Support head and neck during the first few months',
                    'Start tummy time from day one for short periods'
                ],
                'safetyWarnings': [
                    'Always supervise during tummy time',
                    'Place baby on firm, flat surface - never on soft bedding',
                    'Never leave baby unattended on elevated surfaces',
                    'Support head when picking up or carrying baby'
                ],
                'whatToExpect': 'By 2-4 months, most babies develop enough neck strength to lift their head 45-90 degrees while on their tummy. You may notice your baby holding their head more steadily when you hold them upright. This milestone is crucial for developing upper body strength needed for later skills like sitting and crawling.',
                'redFlags': [
                    'No head control by 4 months',
                    'Head always tilted to one side (possible torticollis)',
                    'Cannot lift head at all during tummy time by 3 months',
                    'Floppy head movements with no improvement'
                ]
            }
        },
        {
            'milestoneName': 'Kamazhnu veezhal (Tummy to back rolling)',
            'data': {
                'checklistItems': [
                    'Rolls from tummy to back on their own',
                    'Uses arm strength to push and turn',
                    'Shows intention to move and explore',
                    'May roll back to tummy as well'
                ],
                'videoUrl': 'https://www.youtube.com/embed/8vDDvhJEt-k',
                'tips': [
                    'Give plenty of supervised floor time for practice',
                    'Place interesting toys to one side to encourage rolling',
                    'Gently guide baby through rolling motion during play',
                    'Celebrate each rolling attempt to encourage the behavior',
                    'Remove pillows and soft items from play area'
                ],
                'safetyWarnings': [
                    'Never leave baby alone on changing table or bed - rolling can happen suddenly!',
                    'Keep one hand on baby during diaper changes',
                    'Ensure play area is safe with no hard edges nearby',
                    'Remove loose blankets and toys from sleep area',
                    'Once baby can roll, stop swaddling during sleep'
                ],
                'whatToExpect': 'Rolling from tummy to back usually happens before back to tummy (which comes around 5-7 months). Your baby might surprise you one day by suddenly flipping over! Some babies skip rolling altogether and move straight to sitting or crawling - this is normal. The key is that baby shows progressive motor development.',
                'redFlags': [
                    'No rolling in either direction by 7 months',
                    'Only rolls to one side consistently (possible asymmetry)',
                    'Appears stiff or difficult to move limbs',
                    'No interest in moving or reaching for toys'
                ]
            }
        },
        {
            'milestoneName': 'Sitting with support',
            'data': {
                'checklistItems': [
                    'Sits with back support for several minutes',
                    'Holds head steady while sitting',
                    'Can lean forward slightly without falling',
                    'Shows interest in sitting position'
                ],
                'videoUrl': 'https://www.youtube.com/embed/TeSSWtkF4yo',
                'tips': [
                    'Support baby in sitting position during playtime',
                    'Use cushions to create a supportive sitting area',
                    'Sit with baby between your legs for support',
                    'Keep sitting sessions short (5-10 minutes) initially',
                    'Place toys within reach to encourage sitting'
                ],
                'safetyWarnings': [
                    'Never use infant seats or bumbo seats for prolonged periods',
                    'Always stay within arm\'s reach when baby is sitting',
                    'Ensure soft landing area around baby',
                    'Don\'t force sitting before baby is ready',
                    'Avoid walkers - they can delay development and cause injuries'
                ],
                'whatToExpect': 'Sitting with support is an important step toward independent sitting. Your baby will first need head and neck control, then trunk strength. Initially, baby may wobble or topple over, which is completely normal. With practice, they will build the muscle strength needed for independent sitting.',
                'redFlags': [
                    'Cannot hold head up while sitting by 6 months',
                    'Shows no interest in sitting position',
                    'Body is very stiff or very floppy when sitting',
                    'Cannot bear any weight on legs when supported'
                ]
            }
        },
        {
            'milestoneName': 'Sitting without support',
            'data': {
                'checklistItems': [
                    'Sits without support for 30+ seconds',
                    'Maintains balance while sitting',
                    'Can turn head while sitting without falling',
                    'May use hands for support occasionally (tripod sitting)'
                ],
                'videoUrl': 'https://www.youtube.com/embed/NWNGsMZMJy8',
                'tips': [
                    'Encourage floor play in sitting position',
                    'Arrange toys in a circle around sitting baby',
                    'Let baby practice reaching while sitting',
                    'Praise attempts even if baby falls over',
                    'Create safe space with soft surfaces while learning'
                ],
                'safetyWarnings': [
                    'Pad the area around baby while learning',
                    'Remove sharp objects and hard toys from reach',
                    'Never leave baby sitting on elevated surfaces',
                    'Ensure stable, flat surface for sitting practice',
                    'Baby may suddenly lunge for toys - stay close'
                ],
                'whatToExpect': 'Independent sitting typically develops between 6-8 months. Initially, baby may use "tripod" position with hands on floor for support. Soon they will sit with straight back and free hands to play with toys. This opens up a whole new world of exploration and play for your baby!',
                'redFlags': [
                    'Cannot sit without support by 9 months',
                    'Always falls to one particular side',
                    'Extremely rounded back while sitting',
                    'No attempt to catch themselves when falling'
                ]
            }
        },
        {
            'milestoneName': 'Crawling',
            'data': {
                'checklistItems': [
                    'Moves forward on hands and knees',
                    'Alternates arm and leg movements',
                    'Can crawl to reach desired toys',
                    'May use different crawling styles (army crawl, scoot, etc.)'
                ],
                'videoUrl': 'https://www.youtube.com/embed/Gphok28coOk',
                'tips': [
                    'Create safe crawling space at home',
                    'Place toys just out of reach to encourage movement',
                    'Get down on floor and crawl with baby',
                    'Ensure plenty of tummy time for muscle development',
                    'Some babies skip crawling - this is normal!'
                ],
                'safetyWarnings': [
                    'Baby-proof your home NOW - cover outlets, secure furniture',
                    'Install safety gates on stairs',
                    'Remove small objects baby could choke on',
                    'Keep cleaning supplies and medications locked away',
                    'Check floor for hazards daily - babies are fast!'
                ],
                'whatToExpect': 'Crawling styles vary widely - some babies do classic hands-and-knees, others army crawl, scoot on bottom, or roll to get places. Some skip crawling entirely and go straight to walking. What matters is that baby is finding ways to move and explore. Crawling develops coordination and spatial awareness.',
                'redFlags': [
                    'No attempt to move or crawl by 12 months',
                    'Uses only one side of body to move',
                    'Drags one side while crawling',
                    'Shows no interest in exploring or moving toward objects'
                ]
            }
        },
        {
            'milestoneName': 'Pulling to stand',
            'data': {
                'checklistItems': [
                    'Pulls up to standing using furniture',
                    'Bears full weight on legs',
                    'Can hold standing position for a few seconds',
                    'May bounce or step while standing'
                ],
                'videoUrl': 'https://www.youtube.com/embed/AZFPKR5LoQQ',
                'tips': [
                    'Provide stable, sturdy furniture for pulling up',
                    'Encourage standing during play',
                    'Let baby practice lowering down safely',
                    'Bare feet are best for balance and grip',
                    'Be patient - baby may get stuck standing at first!'
                ],
                'safetyWarnings': [
                    'Anchor all heavy furniture to walls - tip-over hazard!',
                    'Pad sharp furniture corners',
                    'Remove unstable items baby might grab',
                    'Keep floor clear of slipping hazards',
                    'Watch for falls - babies learning to stand fall often'
                ],
                'whatToExpect': 'Once baby masters pulling to stand, they may get "stuck" standing and cry for help getting down. This is normal! They need to learn the controlled lowering motion. Your baby will practice pulling up on everything - furniture, your legs, even the dog! Standing strengthens leg muscles needed for walking.',
                'redFlags': [
                    'Cannot bear weight on legs by 12 months',
                    'Shows no interest in standing',
                    'Stands only on tiptoes consistently',
                    'Legs cross or appear very stiff when standing'
                ]
            }
        },
        {
            'milestoneName': 'Cruising (holding furniture and walking)',
            'data': {
                'checklistItems': [
                    'Walks sideways holding furniture',
                    'Moves from one furniture piece to another',
                    'Can reach for toys while cruising',
                    'Shows confidence in standing balance'
                ],
                'videoUrl': 'https://www.youtube.com/embed/qqJvX0kMmFM',
                'tips': [
                    'Arrange furniture to create cruising pathway',
                    'Place toys along the cruising route',
                    'Encourage cruising by standing at furniture end',
                    'Celebrate each cruising attempt',
                    'Let baby cruise barefoot for better grip'
                ],
                'safetyWarnings': [
                    'Ensure all furniture is stable and anchored',
                    'Remove wheels from furniture baby uses for support',
                    'Clear pathways of clutter and toys',
                    'Be ready to catch tumbles',
                    'Watch for pinched fingers in furniture gaps'
                ],
                'whatToExpect': 'Cruising is the bridge between standing and walking. Your baby will sidestep along furniture, gaining confidence and balance. They may cruise for weeks or months before taking independent steps. Some babies cruise backward before going forward! This is all normal development.',
                'redFlags': [
                    'No cruising or walking attempts by 15 months',
                    'Cannot stand even with support by 12 months',
                    'Significant asymmetry in leg use',
                    'Extreme toe-walking while cruising'
                ]
            }
        },
        {
            'milestoneName': 'First steps',
            'data': {
                'checklistItems': [
                    'Takes 2-3 independent steps',
                    'Can stand alone for a few seconds',
                    'May walk with arms raised for balance',
                    'Shows excitement about walking'
                ],
                'videoUrl': 'https://www.youtube.com/embed/Kc6cNXL39LY',
                'tips': [
                    'Encourage walking between parents (short distances)',
                    'Praise every walking attempt',
                    'Use favorite toys to motivate walking',
                    'Keep shoes off indoors - bare feet are best',
                    'Don\'t rush - every baby has their own timeline'
                ],
                'safetyWarnings': [
                    'Stay close during early walking - falls are frequent',
                    'Clear walking paths of obstacles',
                    'Ensure safe landing surfaces',
                    'Use shoes only when walking outside',
                    'Watch for toe-stubbing hazards'
                ],
                'whatToExpect': 'First steps are an exciting milestone! Early walkers typically take a few wobbly steps before falling or sitting down. Arms may be held high for balance, giving a "Frankenstein" appearance. This is normal! Walking develops gradually over weeks and months.',
                'redFlags': [
                    'No walking attempts by 18 months',
                    'Cannot stand alone by 15 months',
                    'Walks exclusively on tiptoes',
                    'Significant limp or favoring one leg'
                ]
            }
        },
        {
            'milestoneName': 'Walking independently',
            'data': {
                'checklistItems': [
                    'Walks across room without support',
                    'Can start and stop walking',
                    'Walks with improving balance',
                    'May start to run or climb'
                ],
                'videoUrl': 'https://www.youtube.com/embed/W3W3R3OKbKs',
                'tips': [
                    'Provide plenty of safe walking practice',
                    'Take baby for short outdoor walks',
                    'Play active games that encourage walking',
                    'Let baby push/pull walking toys',
                    'Bare feet indoors help with balance development'
                ],
                'safetyWarnings': [
                    'Supervise outdoor walking - traffic and hazards',
                    'Use well-fitted shoes for outdoor walking only',
                    'Watch for climbing attempts - new danger!',
                    'Pool safety is critical - walking babies can reach water',
                    'Keep stair gates closed - climbing skills developing'
                ],
                'whatToExpect': 'Independent walking typically develops between 12-18 months. Early walking is often wide-legged and wobbly. Over time, balance improves and walking becomes smooth. Soon baby will run, jump, and climb! Remember: later walkers are just as normal as early walkers.',
                'redFlags': [
                    'No independent walking by 18 months (consult doctor)',
                    'Persistent toe-walking after several months of walking',
                    'Significant balance problems or frequent falling',
                    'Loss of previously acquired walking skills'
                ]
            }
        }
    ]
    
    # Update each milestone
    updated_count = 0
    for update in updates:
        result = milestones_collection.update_one(
            {'milestoneName': update['milestoneName']},
            {'$set': {**update['data'], 'updatedAt': datetime.now(timezone.utc)}}
        )
        if result.modified_count > 0:
            print(f"✓ Updated: {update['milestoneName']}")
            updated_count += 1
        else:
            print(f"⚠ Skipped: {update['milestoneName']} (not found or already updated)")
    
    print(f"\n✅ Successfully updated {updated_count} milestones with educational content!")

if __name__ == '__main__':
    update_milestones_with_educational_content()
