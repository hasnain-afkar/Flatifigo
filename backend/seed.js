require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const Profile = require("./models/Profile");
const Listing = require("./models/Listing");

// The specific users requested by the user
const students = [
  { full_name: "Hasnain Afkar", email: "hasnain@demo.com", role: "student", occ: "CS Student @ FAST", bio: "Tech enthusiast and final year student. Looking for a quiet, study-friendly environment in Islamabad.", min: 15000, max: 25000, city: "islamabad", area: "G-11", life: "nightowl", sched: "mixed", avatar: "talal.jpeg", gender: "male" },
  { full_name: "Talal Amer", email: "talal@demo.com", role: "jobholder", occ: "Marketing Specialist", bio: "Young professional working in digital marketing. Looking for a neat space and like-minded roommates.", min: 20000, max: 35000, city: "islamabad", area: "F-8", life: "flexible", sched: "morning", avatar: "hasnain.jpeg", gender: "male" },
  { full_name: "Humayl Abdullah", email: "humayl@demo.com", role: "student", occ: "Engineering Student", bio: "Civil Engineering student. Organized, dependable, and easy-going. Looking for a shared room with good vibes.", min: 12000, max: 20000, city: "islamabad", area: "I-8", life: "earlybird", sched: "morning", avatar: "umer.jpeg", gender: "male" },
  { full_name: "Umer Butt", email: "umer@demo.com", role: "student", occ: "Pre-Med Student", bio: "Studying hard and looking for a compatible roommate who values silence and focus.", min: 10000, max: 18000, city: "lahore", area: "Model Town", life: "flexible", sched: "mixed", avatar: "humayl.JPG", gender: "male" },
  { full_name: "Sami Ullah", email: "sami@demo.com", role: "student", occ: "BBA Student", bio: "Friendly and tidy student looking for a shared flat with respectful roommates.", min: 14000, max: 24000, city: "islamabad", area: "G-10", life: "flexible", sched: "mixed", avatar: "sami.jpeg", gender: "male" },
  { full_name: "Bakhshi Ali", email: "bakhshi@demo.com", role: "jobholder", occ: "Sales Executive", bio: "Working professional who prefers a clean, peaceful place close to public transport.", min: 22000, max: 36000, city: "lahore", area: "Johar Town", life: "earlybird", sched: "morning", avatar: "bakhshi.jpeg", gender: "male" },
  { full_name: "Dawar Khan", email: "dawar@demo.com", role: "student", occ: "Software Engineering Student", bio: "Easy-going, focused on studies, and looking for reliable roommates.", min: 16000, max: 28000, city: "islamabad", area: "H-13", life: "nightowl", sched: "evening", avatar: "dawar.jpeg", gender: "male" },
  { full_name: "Muneeb Ahmed", email: "muneeb@demo.com", role: "jobholder", occ: "Junior Developer", bio: "Quiet professional looking for a furnished shared flat with good internet.", min: 25000, max: 40000, city: "rawalpindi", area: "Bahria Town", life: "flexible", sched: "morning", avatar: "muneeb.jpeg", gender: "male" },
  { full_name: "Wasil Khan", email: "wasil@demo.com", role: "student", occ: "Architecture Student", bio: "Creative student who keeps common spaces organized and respects privacy.", min: 13000, max: 22000, city: "lahore", area: "DHA", life: "nightowl", sched: "mixed", avatar: "wasil.jpeg", gender: "male" },
  { full_name: "Ahmad Raza", email: "ahmad@demo.com", role: "jobholder", occ: "Accountant", bio: "Responsible and clean roommate seeker with a regular office schedule.", min: 20000, max: 32000, city: "karachi", area: "Clifton", life: "earlybird", sched: "morning", avatar: "ahmad.jpeg", gender: "male" },
  { full_name: "Zeyan Malik", email: "zeyan@demo.com", role: "student", occ: "Media Studies Student", bio: "Social but considerate, looking for roommates who balance work and fun.", min: 15000, max: 25000, city: "islamabad", area: "F-8", life: "flexible", sched: "mixed", avatar: "zeyan.jpeg", gender: "male" },
  { full_name: "Abdul Rehman", email: "rehman@demo.com", role: "jobholder", occ: "Operations Associate", bio: "Looking for a secure shared apartment with practical amenities and calm roommates.", min: 24000, max: 38000, city: "lahore", area: "Gulberg", life: "earlybird", sched: "morning", avatar: "rehman.jpeg", gender: "male" },
  { full_name: "Awais Shah", email: "awais@demo.com", role: "student", occ: "Electrical Engineering Student", bio: "Late-night study routine, friendly, and comfortable sharing chores.", min: 12000, max: 21000, city: "rawalpindi", area: "Satellite Town", life: "nightowl", sched: "evening", avatar: "awais.jpeg", gender: "male" },
  { full_name: "Stone Malik", email: "stone@demo.com", role: "jobholder", occ: "Graphic Designer", bio: "Creative professional looking for a neat space with dependable internet.", min: 18000, max: 30000, city: "islamabad", area: "E-11", life: "flexible", sched: "mixed", avatar: "stone.jpeg", gender: "male" },
  { full_name: "Fatima Ali", email: "fatima.new@demo.com", role: "jobholder", occ: "Teacher", bio: "Early to bed, early to rise. Looking for a neat and peaceful apartment.", min: 18000, max: 28000, city: "islamabad", area: "E-11", life: "earlybird", sched: "morning", avatar: "fatima.jpeg", gender: "female" },
  { full_name: "Hasham Khan", email: "hasham@demo.com", role: "student", occ: "Business Student", bio: "Friendly and organized. Looking for a comfortable shared room.", min: 15000, max: 25000, city: "lahore", area: "DHA", life: "flexible", sched: "mixed", avatar: "hasham.jpeg", gender: "male" },
  { full_name: "Hassan Ali", email: "hassan@demo.com", role: "jobholder", occ: "Software Engineer", bio: "Quiet and focused. Out during the day, need a relaxing place to crash.", min: 25000, max: 40000, city: "karachi", area: "Clifton", life: "earlybird", sched: "morning", avatar: "hassan.jpeg", gender: "male" },
  { full_name: "Maan Tariq", email: "maan@demo.com", role: "student", occ: "Arts Student", bio: "Creative individual looking for a spacious room and easygoing roommates.", min: 16000, max: 30000, city: "islamabad", area: "F-10", life: "flexible", sched: "mixed", avatar: "maan.jpeg", gender: "male" },
  { full_name: "Noor Fatima", email: "noor@demo.com", role: "jobholder", occ: "HR Manager", bio: "Clean and organized. Seeking a secure and comfortable living space.", min: 30000, max: 50000, city: "lahore", area: "Gulberg", life: "earlybird", sched: "morning", avatar: "noor.jpeg", gender: "female" },
  { full_name: "Saleem Ahmed", email: "saleem@demo.com", role: "jobholder", occ: "Banker", bio: "Professional looking for a well-maintained flat with good internet.", min: 22000, max: 35000, city: "rawalpindi", area: "Bahria Town", life: "flexible", sched: "morning", avatar: "saleem.jpeg", gender: "male" },
  { full_name: "Shaheer Malik", email: "shaheer@demo.com", role: "student", occ: "Computer Science", bio: "Late-night coder, respect privacy, looking for tech-friendly roommates.", min: 14000, max: 24000, city: "islamabad", area: "H-13", life: "nightowl", sched: "evening", avatar: "shaheer.jpeg", gender: "male" },
  { full_name: "Sohaib Rasheed", email: "sohaib@demo.com", role: "student", occ: "Medical Student", bio: "Busy with studies, looking for a quiet and focused environment.", min: 12000, max: 22000, city: "lahore", area: "Model Town", life: "earlybird", sched: "mixed", avatar: "sohaib.jpeg", gender: "male" }
];

const dummy_users = [
  ...students,
  { name: "Admin User", email: "admin@demo.com", role: "admin", occ: "Platform Administrator", bio: "Flatifigo platform administrator responsible for listing verification and moderation.", min: 0, max: 0, city: "islamabad", area: "", life: "flexible", sched: "morning", gender: "any" },
  { name: "Ali Raza", email: "ali.owner@demo.com", role: "owner", occ: "Property Owner", bio: "Verified owner with furnished flats in Islamabad.", min: 0, max: 0, city: "islamabad", area: "F-7", life: "flexible", sched: "morning", gender: "any" },
  { name: "Sara Khan", email: "sara.owner@demo.com", role: "owner", occ: "Property Owner", bio: "Manages secure apartments for students and jobholders.", min: 0, max: 0, city: "lahore", area: "DHA", life: "flexible", sched: "morning", gender: "any" }
];

const sampleListings = [
  {
    ownerEmail: "ali.owner@demo.com",
    title: "Luxury furnished flat in Islamabad",
    description: "A clean, furnished flat close to markets and public transport. Good fit for students or jobholders.",
    rent: 45000,
    rooms: 2,
    city: "islamabad",
    area: "F-7",
    amenities: ["wifi", "furnished", "ac", "parking"],
    images: ["1.jpg.jpeg"],
    contactName: "Ali Raza",
    contactPhone: "03001234567",
  },
  {
    ownerEmail: "sara.owner@demo.com",
    title: "Newly furnished apartment in Lahore",
    description: "Secure apartment with kitchen, AC, and nearby shopping access in DHA Phase 5.",
    rent: 60000,
    rooms: 3,
    city: "lahore",
    area: "DHA Phase 5",
    amenities: ["wifi", "furnished", "ac", "kitchen", "security"],
    images: ["2.jpg.jpeg"],
    contactName: "Sara Khan",
    contactPhone: "03007654321",
  },
  {
    ownerEmail: "ali.owner@demo.com",
    title: "Shared apartment near G-13 Islamabad",
    description: "Budget-friendly shared apartment with reliable internet and a calm study environment.",
    rent: 30000,
    rooms: 2,
    city: "islamabad",
    area: "G-13",
    amenities: ["wifi", "kitchen", "security"],
    images: ["11.jpg"],
    contactName: "Ali Raza",
    contactPhone: "03001234567",
  },
];

function copyUploadIfPresent(filename) {
  const srcUploads = path.join(__dirname, "..", "uploads");
  const destUploads = path.join(__dirname, "uploads");
  const srcPath = path.join(srcUploads, filename);
  const destPath = path.join(destUploads, filename);

  if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB for seeding.");

    // Copy image assets into the Node backend upload directory.
    const destUploads = path.join(__dirname, "uploads");
    if (!fs.existsSync(destUploads)) {
      fs.mkdirSync(destUploads, { recursive: true });
    }

    students.forEach(s => copyUploadIfPresent(s.avatar));
    sampleListings.flatMap(listing => listing.images).forEach(copyUploadIfPresent);

    const passHash = await bcrypt.hash("pass123", 10);

    for (const d of dummy_users) {
      const email = d.email || (d.name.replace(" ", "").toLowerCase() + "@demo.com");
      const fullName = d.full_name || d.name;
      
      // Upsert User
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          fullName: fullName,
          email,
          password: passHash,
          role: d.role
        });
      }

      // Upsert Profile
      let profile = await Profile.findOne({ userId: user._id });
      if (!profile) {
        profile = new Profile({ userId: user._id });
      }

      profile.occupation = d.occ;
      profile.bio = d.bio;
      profile.budgetMin = d.min;
      profile.budgetMax = d.max;
      profile.preferredCity = d.city;
      profile.preferredArea = d.area;
      profile.lifestyle = d.life;
      profile.schedule = d.sched;
      profile.genderPreference = d.gender;
      profile.avatar = d.avatar || "";
      profile.lookingForRoommate = true;
      
      await profile.save();
    }

    for (const item of sampleListings) {
      const owner = await User.findOne({ email: item.ownerEmail });
      if (!owner) continue;

      await Listing.updateOne(
        { title: item.title, ownerId: owner._id },
        {
          $set: {
            description: item.description,
            rent: item.rent,
            rooms: item.rooms,
            city: item.city,
            area: item.area,
            amenities: item.amenities,
            images: item.images,
            contactName: item.contactName,
            contactPhone: item.contactPhone,
            status: "approved",
          },
          $setOnInsert: {
            ownerId: owner._id,
            views: 0,
          },
        },
        { upsert: true }
      );
    }

    console.log("Seeding complete: users, profiles, and listings are ready.");

  } catch (error) {
    console.error("Seeding error:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(process.exitCode || 0);
  }
}

seed();
