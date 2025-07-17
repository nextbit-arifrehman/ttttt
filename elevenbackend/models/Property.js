const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'properties';

const Property = {
  create: async (db, propertyData) => {
    const result = await db.collection(COLLECTION_NAME).insertOne(propertyData);
    return db.collection(COLLECTION_NAME).findOne({ _id: result.insertedId });
  },

  getAllProperties: async (db, filter, sortOptions) => {
    return db.collection(COLLECTION_NAME).find(filter).sort(sortOptions).toArray();
  },

  getPropertyById: async (db, id) => {
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },

  updateProperty: async (db, id, updateData) => {
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  },

  deleteProperty: async (db, id) => {
    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  updateVerificationStatus: async (db, id, status) => {
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: { verificationStatus: status } }
    );
    return result.modifiedCount > 0;
  },

  advertiseProperty: async (db, id, isAdvertised) => {
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: { isAdvertised } }
    );
    return result.modifiedCount > 0;
  },

  getAdvertisedProperties: async (db) => {
    return db.collection(COLLECTION_NAME).find({ isAdvertised: true, verificationStatus: 'verified' }).toArray();
  },

  getLatestAdvertisedProperties: async (db, limit) => {
    return db.collection(COLLECTION_NAME).find({ isAdvertised: true, verificationStatus: 'verified' }).sort({ createdAt: -1 }).limit(limit).toArray();
  },

  searchPropertiesByLocation: async (db, location) => {
    return db.collection(COLLECTION_NAME).find({ location: { $regex: location, $options: 'i' }, verificationStatus: 'verified' }).toArray();
  },

  sortPropertiesByPrice: async (db, order) => {
    return db.collection(COLLECTION_NAME).find({ verificationStatus: 'verified' }).sort({ 'priceRange.min': order }).toArray();
  },
};

module.exports = Property;