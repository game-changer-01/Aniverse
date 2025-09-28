const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Anime = require('./models/Anime');

dotenv.config();

const sampleAnimes = [
  {
    title: "Attack on Titan",
    description: "Humanity fights for survival against giant humanoid Titans.",
    poster: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    trailer: "https://www.youtube.com/watch?v=SGy0Dd78IkE",
    year: 2013,
    status: "Completed",
    rating: 9.0,
    genres: ["Action", "Drama", "Fantasy"],
    studio: "Mappa",
    totalEpisodes: 75,
  featured: true,
  popularity: 980,
    trending: true,
    episodes: [
      {
        number: 1,
        title: "To You, 2000 Years From Now",
        duration: 24,
        streamUrl: "https://example.com/stream/aot-ep1.m3u8",
        thumbnail: "https://cdn.myanimelist.net/images/anime/10/47347.jpg"
      },
      {
        number: 2,
        title: "That Day",
        duration: 24,
        streamUrl: "https://example.com/stream/aot-ep2.m3u8",
        thumbnail: "https://cdn.myanimelist.net/images/anime/10/47347.jpg"
      }
    ]
  },
  {
    title: "Demon Slayer",
    description: "A young boy becomes a demon slayer to save his sister.",
    poster: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    trailer: "https://www.youtube.com/watch?v=VQGCKyvzIM4",
    year: 2019,
    status: "Ongoing",
    rating: 8.7,
    genres: ["Action", "Supernatural", "Historical"],
    studio: "Ufotable",
    totalEpisodes: 44,
  featured: true,
  popularity: 920,
    trending: true,
    episodes: [
      {
        number: 1,
        title: "Cruelty",
        duration: 23,
        streamUrl: "https://example.com/stream/ds-ep1.m3u8",
        thumbnail: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg"
      }
    ]
  },
  {
    title: "Your Name",
    description: "Two teenagers share a profound, magical connection.",
    poster: "https://cdn.myanimelist.net/images/anime/5/87048.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/5/87048l.jpg",
    trailer: "https://www.youtube.com/watch?v=xU47nhruN-Q",
    year: 2016,
    status: "Completed",
    rating: 8.4,
    genres: ["Romance", "Drama", "Supernatural"],
    studio: "CoMix Wave Films",
    totalEpisodes: 1,
  featured: true,
  popularity: 870,
    trending: false,
    episodes: [
      {
        number: 1,
        title: "Your Name",
        duration: 106,
        streamUrl: "https://example.com/stream/yourname.m3u8",
        thumbnail: "https://cdn.myanimelist.net/images/anime/5/87048.jpg"
      }
    ]
  },
  {
    title: "One Piece",
    description: "A young pirate searches for the ultimate treasure.",
    poster: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    trailer: "https://www.youtube.com/watch?v=MCb13lbVGE0",
    year: 1999,
    status: "Ongoing",
    rating: 9.1,
    genres: ["Action", "Adventure", "Comedy"],
    studio: "Toei Animation",
    totalEpisodes: 1000,
  featured: false,
  popularity: 999,
    trending: true,
    episodes: [
      {
        number: 1,
        title: "I'm Luffy! The Man Who's Gonna Be King of the Pirates!",
        duration: 24,
        streamUrl: "https://example.com/stream/op-ep1.m3u8",
        thumbnail: "https://cdn.myanimelist.net/images/anime/6/73245.jpg"
      }
    ]
  },
  {
    title: "Spirited Away",
    description: "A girl enters a world ruled by gods and witches.",
    poster: "https://cdn.myanimelist.net/images/anime/6/179.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/6/179l.jpg",
    trailer: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
    year: 2001,
    status: "Completed",
    rating: 9.3,
    genres: ["Adventure", "Family", "Supernatural"],
    studio: "Studio Ghibli",
    totalEpisodes: 1,
  featured: true,
  popularity: 890,
    trending: false,
    episodes: [
      {
        number: 1,
        title: "Spirited Away",
        duration: 125,
        streamUrl: "https://example.com/stream/spirited-away.m3u8",
        thumbnail: "https://cdn.myanimelist.net/images/anime/6/179.jpg"
      }
    ]
  },
  {
    title: "Naruto",
    description: "A young ninja seeks recognition and dreams of becoming Hokage.",
    poster: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg",
    trailer: "https://www.youtube.com/watch?v=1dy2zPPrKD0",
    year: 2002,
    status: "Completed",
    rating: 8.3,
    genres: ["Action", "Adventure", "Martial Arts"],
    studio: "Pierrot",
    totalEpisodes: 720,
  featured: false,
  popularity: 910,
    trending: true,
    episodes: [
      {
        number: 1,
        title: "Enter: Naruto Uzumaki!",
        duration: 23,
        streamUrl: "https://example.com/stream/naruto-ep1.m3u8",
        thumbnail: "https://cdn.myanimelist.net/images/anime/13/17405.jpg"
      }
    ]
  }
];

// Generate additional synthetic popular anime to reach ~500 items
function generatePopular(n = 500) {
  const arr = [];
  for (let i = 1; i <= n; i++) {
    const pop = 1000 - i; // ensure a descending popularity
    arr.push({
      title: `Popular Anime JP #${i}`,
      description: `Synthetic entry #${i} for testing Top Popular listing.`,
      poster: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
      banner: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
      trailer: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      year: 2000 + (i % 25),
      status: i % 3 === 0 ? 'Completed' : 'Ongoing',
      rating: Math.max(6, 10 - (i % 5) * 0.3),
      genres: ["Action", "Adventure", (i % 2 ? "Fantasy" : "Drama")],
      studio: "Studio Test",
      totalEpisodes: 12 + (i % 3) * 12,
      featured: false,
      trending: i % 4 === 0,
      popularity: pop,
      episodes: [
        {
          number: 1,
          title: `Episode 1`,
          duration: 24,
          streamUrl: `https://example.com/stream/popular-${i}-ep1.m3u8`,
          thumbnail: "https://cdn.myanimelist.net/images/anime/10/47347.jpg"
        }
      ]
    });
  }
  return arr;
}

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Anime.deleteMany({});
    console.log('Cleared existing anime data');

  // Insert sample data + generated popular
  const data = sampleAnimes.concat(generatePopular(500));
  await Anime.insertMany(data);
    console.log('Sample anime data inserted successfully');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();