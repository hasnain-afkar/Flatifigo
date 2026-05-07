require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

const User = require("./models/User");
const Message = require("./models/Message");

// Conversations we want to seed (by email pairs)
const conversations = [
  {
    from: "hasnain@demo.com",
    to: "umer@demo.com",
    messages: [
      { dir: "from", content: "Hey Umer! I saw we're both looking for flats. Are you still searching in Lahore?", mins: -120 },
      { dir: "to", content: "Hey Hasnain! Yes I am. Model Town area ideally. You?", mins: -115 },
      { dir: "from", content: "I'm in Islamabad but thinking of relocating for uni. What's your budget range?", mins: -110 },
      { dir: "to", content: "Around 10-18k. Let me know if you find anything good!", mins: -105 },
      { dir: "from", content: "Sure! I'll keep you posted. Good luck with your studies!", mins: -60 },
    ]
  },
  {
    from: "hasnain@demo.com",
    to: "talal@demo.com",
    messages: [
      { dir: "from", content: "Talal bhai! I saw your profile. We're both in Islamabad — want to share a flat?", mins: -200 },
      { dir: "to", content: "Hey! Yes I'm actively looking in F-8 area. What's your schedule like?", mins: -195 },
      { dir: "from", content: "I'm a night owl mostly, but flexible on weekends. You?", mins: -190 },
      { dir: "to", content: "I work 9-5 so mornings are busy. Evenings I'm usually free. Could work!", mins: -185 },
      { dir: "from", content: "Perfect. Let's meet up this weekend to check some listings?", mins: -100 },
      { dir: "to", content: "Sounds great! Saturday works for me. I'll send you some listings I found.", mins: -95 },
    ]
  },
  {
    from: "humayl@demo.com",
    to: "hasnain@demo.com",
    messages: [
      { dir: "from", content: "Hey Hasnain! Are you the CS student at FAST? I'm at NUST doing civil engineering.", mins: -300 },
      { dir: "to", content: "Yes that's me! Nice to meet you. Looking for a roommate?", mins: -295 },
      { dir: "from", content: "Yeah, ideally someone in G-11 or I-8 area. I'm very organized and keep things clean.", mins: -290 },
      { dir: "to", content: "I'm in G-11 right now! My current lease ends next month. Let's talk more.", mins: -285 },
    ]
  },
  {
    from: "hasnain@demo.com",
    to: "zainabtariq@demo.com",
    messages: [
      { dir: "to", content: "Hi! I noticed we have similar preferences for F-8. Are you still looking?", mins: -150 },
      { dir: "from", content: "Yes! I found a nice 2-bed apartment there. Would you be interested in checking it out?", mins: -145 },
      { dir: "to", content: "Definitely! Can you share the listing link?", mins: -140 },
    ]
  },
  {
    from: "hasnain@demo.com",
    to: "fatimali@demo.com",
    messages: [
      { dir: "to", content: "Hello! I saw your profile. I'm a teacher looking for a quiet place in E-11.", mins: -80 },
      { dir: "from", content: "Hi Fatima! E-11 is a great area. I know someone who has a listing there. Let me share it.", mins: -75 },
      { dir: "to", content: "That would be amazing, thank you so much!", mins: -70 },
      { dir: "from", content: "Here you go — check the Browse Flats section, there's a 2-bed in E-11 for 25k.", mins: -65 },
      { dir: "to", content: "Found it! Looks perfect. I'll message the owner.", mins: -50 },
    ]
  },
  {
    from: "umer@demo.com",
    to: "bilalahmed@demo.com",
    messages: [
      { dir: "from", content: "Hey Bilal! Both pre-med and med students — we'd probably understand each other's schedule!", mins: -400 },
      { dir: "to", content: "Haha exactly! Late night study sessions are my thing. You too?", mins: -395 },
      { dir: "from", content: "Same here. I'm looking around Model Town. You?", mins: -390 },
      { dir: "to", content: "Model Town works! Let me know if you find a good 2-bed flat.", mins: -385 },
    ]
  },
];

async function seedMessages() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB for message seeding.");

    // Clear existing messages
    await Message.deleteMany({});
    console.log("Cleared existing messages.");

    let totalInserted = 0;

    for (const conv of conversations) {
      const fromUser = await User.findOne({ email: conv.from });
      const toUser = await User.findOne({ email: conv.to });

      if (!fromUser || !toUser) {
        console.warn(`Skipping conversation: ${conv.from} <-> ${conv.to} (user not found)`);
        continue;
      }

      for (const msg of conv.messages) {
        const senderId = msg.dir === "from" ? fromUser._id : toUser._id;
        const receiverId = msg.dir === "from" ? toUser._id : fromUser._id;
        const createdAt = new Date(Date.now() + msg.mins * 60 * 1000);

        await Message.create({
          senderId,
          receiverId,
          content: msg.content,
          isRead: true,
          createdAt,
          updatedAt: createdAt
        });
        totalInserted++;
      }
    }

    // Mark the last message of each conversation as unread for realism
    for (const conv of conversations) {
      const fromUser = await User.findOne({ email: conv.from });
      const toUser = await User.findOne({ email: conv.to });
      if (!fromUser || !toUser) continue;

      const lastMsg = await Message.findOne({
        $or: [
          { senderId: fromUser._id, receiverId: toUser._id },
          { senderId: toUser._id, receiverId: fromUser._id }
        ]
      }).sort({ createdAt: -1 });

      if (lastMsg) {
        lastMsg.isRead = false;
        await lastMsg.save();
      }
    }

    console.log(`Seeding complete: ${totalInserted} messages inserted across ${conversations.length} conversations.`);
  } catch (error) {
    console.error("Message seeding error:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(process.exitCode || 0);
  }
}

seedMessages();
