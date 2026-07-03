// routes/houses.js

const express = require('express');
const router = express.Router();

const House = require('../models/House');

const { protect, authorize } = require('../middlewares/auth');
const { uploadMultiple } = require('../middlewares/uploads');

/* -----------------------------
   HELPERS
----------------------------- */

const sendResponse = (
  res,
  statusCode,
  success,
  data = null,
  message = null
) => {
  return res.status(statusCode).json({
    success,
    ...(message && { message }),
    ...(data !== null && { data })
  });
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* -----------------------------
   GET ALL HOUSES
----------------------------- */

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { isActive, limit = 100 } = req.query;

    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const houses = await House.find(query)
      .sort('-createdAt')
      .limit(Number(limit));

    return sendResponse(res, 200, true, {
      count: houses.length,
      houses
    });
  })
);

/* -----------------------------
   GET SINGLE HOUSE
----------------------------- */

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const house = await House.findById(req.params.id);

    if (!house) {
      return sendResponse(res, 404, false, null, 'House not found');
    }

    await House.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 }
    });

    const updatedHouse = await House.findById(req.params.id);

    return sendResponse(res, 200, true, updatedHouse);
  })
);

/* -----------------------------
   CREATE HOUSE
----------------------------- */

router.post(
  '/',
  protect,
  authorize('admin', 'editor'),
  uploadMultiple,
  asyncHandler(async (req, res) => {
    const body = { ...req.body };
    const files = req.files || {};

    /* -----------------------------
       COVER IMAGE
    ----------------------------- */

    if (files.image && files.image[0]) {
      body.image = `/uploads/images/${files.image[0].filename}`;
    }

    if (!body.image) {
      return sendResponse(
        res,
        400,
        false,
        null,
        'Cover image is required'
      );
    }

    /* -----------------------------
       PARSE ARRAYS
    ----------------------------- */

    if (typeof body.images === 'string') {
      try {
        body.images = JSON.parse(body.images);
      } catch {
        body.images = [];
      }
    }

    if (typeof body.gallery === 'string') {
      try {
        body.gallery = JSON.parse(body.gallery);
      } catch {
        body.gallery = [];
      }
    }

    if (typeof body.rooms === 'string') {
      try {
        body.rooms = JSON.parse(body.rooms);
      } catch {
        body.rooms = [];
      }
    }

    /* -----------------------------
       OPTIONAL DIRECT FILE UPLOADS
    ----------------------------- */

    if (files.images && files.images.length > 0) {
      body.images = [
        ...(body.images || []),
        ...files.images.map(
          (f) => `/uploads/images/${f.filename}`
        )
      ];
    }

    if (files.gallery && files.gallery.length > 0) {
      body.gallery = [
        ...(body.gallery || []),
        ...files.gallery.map(
          (f) => `/uploads/gallery/${f.filename}`
        )
      ];
    }

    /* -----------------------------
       VIDEO
    ----------------------------- */

    if (files.video && files.video[0]) {
      body.videoUrl = `/uploads/videos/${files.video[0].filename}`;
    }

    /* -----------------------------
       PANORAMA
    ----------------------------- */

    if (files.panorama && files.panorama[0]) {
      body.panorama = `/uploads/panoramas/${files.panorama[0].filename}`;
    }

    /* -----------------------------
       FEATURES
    ----------------------------- */

    if (typeof body.features === 'string') {
      body.features = body.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
    }

    /* -----------------------------
       NUMBERS / BOOLEANS
    ----------------------------- */

    body.bedrooms = Number(body.bedrooms || 0);
    body.bathrooms = Number(body.bathrooms || 0);

    if (body.isActive === 'true') body.isActive = true;
    if (body.isActive === 'false') body.isActive = false;

    /* -----------------------------
       CREATE HOUSE
    ----------------------------- */

    const house = await House.create(body);

    return sendResponse(res, 201, true, house);
  })
);

/* -----------------------------
   UPDATE HOUSE
----------------------------- */

router.put(
  '/:id',
  protect,
  authorize('admin', 'editor'),
  uploadMultiple,
  asyncHandler(async (req, res) => {
    const existingHouse = await House.findById(req.params.id);

    if (!existingHouse) {
      return sendResponse(res, 404, false, null, 'House not found');
    }

    const body = { ...req.body };
    const files = req.files || {};

    /* -----------------------------
       PARSE ARRAYS FIRST
    ----------------------------- */

    if (typeof body.images === 'string') {
      try {
        body.images = JSON.parse(body.images);
      } catch {
        body.images = [];
      }
    }

    if (typeof body.gallery === 'string') {
      try {
        body.gallery = JSON.parse(body.gallery);
      } catch {
        body.gallery = [];
      }
    }

    if (typeof body.rooms === 'string') {
      try {
        body.rooms = JSON.parse(body.rooms);
      } catch {
        body.rooms = [];
      }
    }

    /* -----------------------------
       COVER IMAGE
    ----------------------------- */

    if (files.image && files.image[0]) {
      body.image = `/uploads/images/${files.image[0].filename}`;
    }

    /* -----------------------------
       MERGE IMAGES
    ----------------------------- */

    if (files.images && files.images.length > 0) {
      body.images = [
        ...(body.images || existingHouse.images || []),
        ...files.images.map(
          (f) => `/uploads/images/${f.filename}`
        )
      ];
    }

    /* -----------------------------
       MERGE GALLERY
    ----------------------------- */

    if (files.gallery && files.gallery.length > 0) {
      body.gallery = [
        ...(body.gallery || existingHouse.gallery || []),
        ...files.gallery.map(
          (f) => `/uploads/gallery/${f.filename}`
        )
      ];
    }

    /* -----------------------------
       VIDEO
    ----------------------------- */

    if (files.video && files.video[0]) {
      body.videoUrl = `/uploads/videos/${files.video[0].filename}`;
    }

    /* -----------------------------
       FEATURES
    ----------------------------- */

    if (typeof body.features === 'string') {
      body.features = body.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
    }

    /* -----------------------------
       NUMBERS / BOOLEANS
    ----------------------------- */

    body.bedrooms = Number(body.bedrooms || 0);
    body.bathrooms = Number(body.bathrooms || 0);

    if (body.isActive === 'true') body.isActive = true;
    if (body.isActive === 'false') body.isActive = false;

    body.updatedAt = new Date();

    /* -----------------------------
       UPDATE
    ----------------------------- */

    const updated = await House.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,
        runValidators: true
      }
    );

    return sendResponse(res, 200, true, updated);
  })
);

/* -----------------------------
   DELETE HOUSE
----------------------------- */

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const house = await House.findById(req.params.id);

    if (!house) {
      return sendResponse(res, 404, false, null, 'House not found');
    }

    await house.deleteOne();

    return sendResponse(
      res,
      200,
      true,
      { id: req.params.id },
      'House deleted successfully'
    );
  })
);

module.exports = router;