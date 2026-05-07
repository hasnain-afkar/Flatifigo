/* ==========================================
   Mock Data — Structured Sample Data
   ==========================================
   All hardcoded/demo data lives here.
   Used as fallback when API returns empty.
   
   When real backend is ready, this file can be
   removed entirely — zero UI code changes needed.
   ========================================== */

const MockData = (() => {

    // ── Listings (Browse Page — Fiverr-style cards) ──
    const listings = [
        {
            id: 'mock-1',
            title: 'I will provide a luxury flat in Islamabad.',
            ownerName: 'Ali Raza',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Ali&background=random',
            image: 'uploads/1.jpg.jpeg',
            rating: '★ 5.0',
            ratingCount: '12',
            price: '₨ 45,000',
            city: 'islamabad',
            area: 'F-7',
            rooms: 2,
            rent: 45000,
            amenities: ['wifi', 'furnished', 'ac', 'parking'],
            status: 'available',
            created_at: '2026-04-10'
        },
        {
            id: 'mock-2',
            title: 'I will rent my newly furnished apartment in Lahore',
            ownerName: 'Sara Khan',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Sara&background=random',
            image: 'uploads/2.jpg.jpeg',
            rating: '★ 4.9',
            ratingCount: '8',
            price: '₨ 60,000',
            city: 'lahore',
            area: 'DHA Phase 5',
            rooms: 3,
            rent: 60000,
            amenities: ['wifi', 'furnished', 'ac', 'kitchen', 'security'],
            status: 'available',
            created_at: '2026-04-08'
        },
        {
            id: 'mock-3',
            title: 'I will rent a spacious 2-bedroom flat in Rawalpindi',
            ownerName: 'Ahmad Khan',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Ahmad&background=random',
            image: 'uploads/3.jpg.jpeg',
            rating: '★ 4.8',
            ratingCount: '21',
            price: '₨ 35,000',
            city: 'rawalpindi',
            area: 'Bahria Town Phase 8',
            rooms: 2,
            rent: 35000,
            amenities: ['wifi', 'parking', 'security'],
            status: 'available',
            created_at: '2026-04-05'
        },
        {
            id: 'mock-4',
            title: 'I will provide a fully furnished studio in DHA Karachi',
            ownerName: 'Fatima Noor',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Fatima&background=random',
            image: 'uploads/4.jpg.jpeg',
            rating: '★ 5.0',
            ratingCount: '5',
            price: '₨ 75,000',
            city: 'karachi',
            area: 'DHA Phase 6',
            rooms: 1,
            rent: 75000,
            amenities: ['wifi', 'furnished', 'ac', 'kitchen', 'security', 'gym'],
            status: 'available',
            created_at: '2026-04-12'
        },
        {
            id: 'mock-5',
            title: 'I will rent a secure apartment near university in Faisalabad',
            ownerName: 'Zain Ali',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Zain&background=random',
            image: 'uploads/5.jpg.jpeg',
            rating: '★ 4.7',
            ratingCount: '15',
            price: '₨ 25,000',
            city: 'faisalabad',
            area: 'Madina Town',
            rooms: 2,
            rent: 25000,
            amenities: ['wifi', 'security'],
            status: 'available',
            created_at: '2026-04-01'
        },
        {
            id: 'mock-6',
            title: 'I will provide an executive flat in Gulberg Lahore',
            ownerName: 'Usman Tariq',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Usman&background=random',
            image: 'uploads/6.jpg.jpeg',
            rating: '★ 4.9',
            ratingCount: '32',
            price: '₨ 85,000',
            city: 'lahore',
            area: 'Gulberg III',
            rooms: 3,
            rent: 85000,
            amenities: ['wifi', 'furnished', 'ac', 'kitchen', 'parking', 'security'],
            status: 'available',
            created_at: '2026-03-28'
        },
        {
            id: 'mock-7',
            title: 'I will offer a beautiful corner window apartment in F-11 Markaz',
            ownerName: 'Zoya Khan',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Zoya&background=random',
            image: 'uploads/7.jpg',
            rating: '★ 4.6',
            ratingCount: '11',
            price: '₨ 90,000',
            city: 'islamabad',
            area: 'F-11 Markaz',
            rooms: 3,
            rent: 90000,
            amenities: ['wifi', 'furnished', 'ac', 'kitchen', 'parking'],
            status: 'available',
            created_at: '2026-03-25'
        },
        {
            id: 'mock-8',
            title: 'I will rent a well-maintained family flat in Bahria Town Phase 8',
            ownerName: 'Hassan Bilal',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Hassan&background=random',
            image: 'uploads/8.jpg',
            rating: '★ 4.8',
            ratingCount: '29',
            price: '₨ 40,000',
            city: 'rawalpindi',
            area: 'Bahria Town Phase 8',
            rooms: 2,
            rent: 40000,
            amenities: ['wifi', 'parking', 'security', 'kitchen'],
            status: 'available',
            created_at: '2026-04-02'
        },
        {
            id: 'mock-9',
            title: 'I will rent my stylish minimal studio in Model Town',
            ownerName: 'Maha Noor',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Maha&background=random',
            image: 'uploads/9.jpg',
            rating: '★ 4.9',
            ratingCount: '42',
            price: '₨ 35,000',
            city: 'lahore',
            area: 'Model Town',
            rooms: 1,
            rent: 35000,
            amenities: ['wifi', 'furnished', 'ac'],
            status: 'available',
            created_at: '2026-04-14'
        },
        {
            id: 'mock-10',
            title: 'I will provide a spacious sharing room in Clifton',
            ownerName: 'Sadiq Ali',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Sadiq&background=random',
            image: 'uploads/10.jpg',
            rating: '★ 4.5',
            ratingCount: '7',
            price: '₨ 20,000',
            city: 'karachi',
            area: 'Clifton Block 5',
            rooms: 1,
            rent: 20000,
            amenities: ['wifi', 'security'],
            status: 'available',
            created_at: '2026-03-30'
        },
        {
            id: 'mock-11',
            title: 'I will rent a newly built apartment in G-13',
            ownerName: 'Ayesha Tariq',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Ayesha&background=random',
            image: 'uploads/11.jpg',
            rating: '★ 5.0',
            ratingCount: '19',
            price: '₨ 70,000',
            city: 'islamabad',
            area: 'G-13',
            rooms: 3,
            rent: 70000,
            amenities: ['wifi', 'furnished', 'ac', 'kitchen', 'parking', 'security'],
            status: 'available',
            created_at: '2026-04-11'
        },
        {
            id: 'mock-12',
            title: 'I will rent my prime location 3-bed flat in Johar Town',
            ownerName: 'Waqas Ahmed',
            ownerAvatar: 'https://ui-avatars.com/api/?name=Waqas&background=random',
            image: 'uploads/12.jpg',
            rating: '★ 4.7',
            ratingCount: '55',
            price: '₨ 45,000',
            city: 'lahore',
            area: 'Johar Town',
            rooms: 3,
            rent: 45000,
            amenities: ['wifi', 'furnished', 'kitchen', 'parking'],
            status: 'available',
            created_at: '2026-04-06'
        }
    ];

    // ── Roommates ──
    const roommates = [
        {
            id: 'rm-1',
            full_name: 'Hasnain Afkar',
            avatar: 'talal.jpeg',
            role: 'Student',
            occupation: 'CS Student @ FAST',
            bio: 'Tech enthusiast and final year student. Looking for a quiet, study-friendly environment in Islamabad.',
            budget_min: '15,000',
            budget_max: '25,000',
            preferred_city: 'islamabad'
        },
        {
            id: 'rm-2',
            full_name: 'Talal Amer',
            avatar: 'hasnain.jpeg',
            role: 'Jobholder',
            occupation: 'Marketing Specialist',
            bio: 'Young professional working in digital marketing. Looking for a neat space and like-minded roommates.',
            budget_min: '20,000',
            budget_max: '35,000',
            preferred_city: 'lahore'
        },
        {
            id: 'rm-3',
            full_name: 'Humayl Abdullah',
            avatar: 'umer.jpeg',
            role: 'Student',
            occupation: 'Engineering Student',
            bio: 'Civil Engineering student. Organized, dependable, and easy-going. Looking for a shared room or flat.',
            budget_min: '12,000',
            budget_max: '20,000',
            preferred_city: 'islamabad'
        },
        {
            id: 'rm-4',
            full_name: 'Umer Butt',
            avatar: 'humayl.JPG',
            role: 'Student',
            occupation: 'Pre-Med Student',
            bio: 'Studying hard and looking for a compatible roommate who values silence and focus.',
            budget_min: '10,000',
            budget_max: '18,000',
            preferred_city: 'rawalpindi'
        },
        {
            id: 'rm-5',
            full_name: 'Sami Ullah',
            avatar: 'sami.jpeg',
            role: 'Student',
            occupation: 'BBA Student',
            bio: 'Friendly and tidy student looking for a shared flat with respectful roommates.',
            budget_min: '14,000',
            budget_max: '24,000',
            preferred_city: 'islamabad'
        },
        {
            id: 'rm-6',
            full_name: 'Bakhshi Ali',
            avatar: 'bakhshi.jpeg',
            role: 'Jobholder',
            occupation: 'Sales Executive',
            bio: 'Working professional who prefers a clean, peaceful place close to public transport.',
            budget_min: '22,000',
            budget_max: '36,000',
            preferred_city: 'lahore'
        },
        {
            id: 'rm-7',
            full_name: 'Dawar Khan',
            avatar: 'dawar.jpeg',
            role: 'Student',
            occupation: 'Software Engineering Student',
            bio: 'Easy-going, focused on studies, and looking for reliable roommates.',
            budget_min: '16,000',
            budget_max: '28,000',
            preferred_city: 'islamabad'
        },
        {
            id: 'rm-8',
            full_name: 'Muneeb Ahmed',
            avatar: 'muneeb.jpeg',
            role: 'Jobholder',
            occupation: 'Junior Developer',
            bio: 'Quiet professional looking for a furnished shared flat with good internet.',
            budget_min: '25,000',
            budget_max: '40,000',
            preferred_city: 'rawalpindi'
        },
        {
            id: 'rm-9',
            full_name: 'Wasil Khan',
            avatar: 'wasil.jpeg',
            role: 'Student',
            occupation: 'Architecture Student',
            bio: 'Creative student who keeps common spaces organized and respects privacy.',
            budget_min: '13,000',
            budget_max: '22,000',
            preferred_city: 'lahore'
        },
        {
            id: 'rm-10',
            full_name: 'Ahmad Raza',
            avatar: 'ahmad.jpeg',
            role: 'Jobholder',
            occupation: 'Accountant',
            bio: 'Responsible and clean roommate seeker with a regular office schedule.',
            budget_min: '20,000',
            budget_max: '32,000',
            preferred_city: 'karachi'
        },
        {
            id: 'rm-11',
            full_name: 'Zeyan Malik',
            avatar: 'zeyan.jpeg',
            role: 'Student',
            occupation: 'Media Studies Student',
            bio: 'Social but considerate, looking for roommates who balance work and fun.',
            budget_min: '15,000',
            budget_max: '25,000',
            preferred_city: 'islamabad'
        },
        {
            id: 'rm-12',
            full_name: 'Abdul Rehman',
            avatar: 'rehman.jpeg',
            role: 'Jobholder',
            occupation: 'Operations Associate',
            bio: 'Looking for a secure shared apartment with practical amenities and calm roommates.',
            budget_min: '24,000',
            budget_max: '38,000',
            preferred_city: 'lahore'
        },
        {
            id: 'rm-13',
            full_name: 'Awais Shah',
            avatar: 'awais.jpeg',
            role: 'Student',
            occupation: 'Electrical Engineering Student',
            bio: 'Late-night study routine, friendly, and comfortable sharing chores.',
            budget_min: '12,000',
            budget_max: '21,000',
            preferred_city: 'rawalpindi'
        },
        {
            id: 'rm-14',
            full_name: 'Stone Malik',
            avatar: 'stone.jpeg',
            role: 'Jobholder',
            occupation: 'Graphic Designer',
            bio: 'Creative professional looking for a neat space with dependable internet.',
            budget_min: '18,000',
            budget_max: '30,000',
            preferred_city: 'islamabad'
        },
        {
            id: 'rm-15',
            full_name: 'Fatima Ali',
            avatar: 'fatima.jpeg',
            role: 'Jobholder',
            occupation: 'Teacher',
            bio: 'Early to bed, early to rise. Looking for a neat and peaceful apartment.',
            budget_min: '18,000',
            budget_max: '28,000',
            preferred_city: 'islamabad'
        },
        {
            id: 'rm-16',
            full_name: 'Hasham Khan',
            avatar: 'hasham.jpeg',
            role: 'Student',
            occupation: 'Business Student',
            bio: 'Friendly and organized. Looking for a comfortable shared room.',
            budget_min: '15,000',
            budget_max: '25,000',
            preferred_city: 'lahore'
        },
        {
            id: 'rm-17',
            full_name: 'Hassan Ali',
            avatar: 'hassan.jpeg',
            role: 'Jobholder',
            occupation: 'Software Engineer',
            bio: 'Quiet and focused. Out during the day, need a relaxing place to crash.',
            budget_min: '25,000',
            budget_max: '40,000',
            preferred_city: 'karachi'
        },
        {
            id: 'rm-18',
            full_name: 'Maan Tariq',
            avatar: 'maan.jpeg',
            role: 'Student',
            occupation: 'Arts Student',
            bio: 'Creative individual looking for a spacious room and easygoing roommates.',
            budget_min: '16,000',
            budget_max: '30,000',
            preferred_city: 'islamabad'
        },
        {
            id: 'rm-19',
            full_name: 'Noor Fatima',
            avatar: 'noor.jpeg',
            role: 'Jobholder',
            occupation: 'HR Manager',
            bio: 'Clean and organized. Seeking a secure and comfortable living space.',
            budget_min: '30,000',
            budget_max: '50,000',
            preferred_city: 'lahore'
        },
        {
            id: 'rm-20',
            full_name: 'Saleem Ahmed',
            avatar: 'saleem.jpeg',
            role: 'Jobholder',
            occupation: 'Banker',
            bio: 'Professional looking for a well-maintained flat with good internet.',
            budget_min: '22,000',
            budget_max: '35,000',
            preferred_city: 'rawalpindi'
        },
        {
            id: 'rm-21',
            full_name: 'Shaheer Malik',
            avatar: 'shaheer.jpeg',
            role: 'Student',
            occupation: 'Computer Science',
            bio: 'Late-night coder, respect privacy, looking for tech-friendly roommates.',
            budget_min: '14,000',
            budget_max: '24,000',
            preferred_city: 'islamabad'
        },
        {
            id: 'rm-22',
            full_name: 'Sohaib Rasheed',
            avatar: 'sohaib.jpeg',
            role: 'Student',
            occupation: 'Medical Student',
            bio: 'Busy with studies, looking for a quiet and focused environment.',
            budget_min: '12,000',
            budget_max: '22,000',
            preferred_city: 'lahore'
        }
    ];

    // ── Messages / Conversations ──
    const conversations = [
        {
            id: 'conv-1',
            partnerId: 'u-ali',
            partnerName: 'Ali Khan',
            partnerAvatar: '💛',
            avatarStyle: 'gold',
            online: true,
            messages: [
                { id: 'm1', sender: 'them', text: 'Hi! I saw we matched 85% on Flatifigo. Are you still looking for a room in G-11?', time: '10:42 AM' },
                { id: 'm2', sender: 'me',   text: 'Hey Ali! Yes, I am. I checked your profile and it looks like our schedules align perfectly.', time: '10:45 AM' },
                { id: 'm3', sender: 'them', text: 'Awesome. I found a great 2-bed flat nearby. Do you want to check it out this weekend?', time: '10:57 AM' },
                { id: 'm4', sender: 'me',   text: 'Sounds good! Let\'s meet tomorrow.', time: '11:00 AM' }
            ]
        },
        {
            id: 'conv-2',
            partnerId: 'u-owner',
            partnerName: 'Property Owner (G-11 Flat)',
            partnerAvatar: '🏠',
            avatarStyle: 'dark',
            online: false,
            messages: [
                { id: 'm5', sender: 'me',   text: 'Hi, is the flat in G-11 still available?', time: '9:30 AM' },
                { id: 'm6', sender: 'them', text: 'Yes, the WiFi is included in the rent.', time: '9:45 AM' }
            ]
        }
    ];

    return { listings, roommates, conversations };
})();
