const { MongoClient } = require('mongodb');
require('dotenv').config();

const sampleProperties = [
  {
    _id: "property1",
    title: "Modern Downtown Apartment",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
    priceRange: "$2,500 - $3,000",
    minPrice: 2500,
    maxPrice: 3000,
    agentUid: "agent1",
    agentName: "John Smith",
    agentEmail: "john@example.com",
    verificationStatus: "verified",
    isAdvertised: true,
    createdAt: new Date()
  },
  {
    _id: "property2", 
    title: "Luxury Beach House",
    location: "Miami, FL",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
    priceRange: "$5,000 - $6,000",
    minPrice: 5000,
    maxPrice: 6000,
    agentUid: "agent2",
    agentName: "Jane Doe",
    agentEmail: "jane@example.com",
    verificationStatus: "verified",
    isAdvertised: false,
    createdAt: new Date()
  },
  {
    _id: "property3",
    title: "Cozy Suburban Home",
    location: "Austin, TX",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
    priceRange: "$1,800 - $2,200",
    minPrice: 1800,
    maxPrice: 2200,
    agentUid: "agent3",
    agentName: "Mike Johnson",
    agentEmail: "mike@example.com",
    verificationStatus: "verified",
    isAdvertised: true,
    createdAt: new Date()
  }
];

async function addSampleData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('real-estate-db');
    const collection = db.collection('properties');
    
    // Clear existing data
    await collection.deleteMany({});
    console.log('Cleared existing properties');
    
    // Insert sample data
    const result = await collection.insertMany(sampleProperties);
    console.log(`Inserted ${result.insertedCount} properties`);
    
    // Verify data
    const count = await collection.countDocuments({ verificationStatus: 'verified' });
    console.log(`Total verified properties: ${count}`);
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await client.close();
  }
}

addSampleData();