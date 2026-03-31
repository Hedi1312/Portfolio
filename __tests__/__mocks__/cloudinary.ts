/**
 * Cloudinary mock — prevents real API calls to Cloudinary during tests.
 *
 * uploadToCloudinary and deleteFromCloudinary are jest.fn() stubs that
 * resolve with mock data by default.
 */

export const uploadToCloudinary = jest.fn().mockResolvedValue({
  url: 'https://res.cloudinary.com/test/image/upload/v1/test/file.jpg',
  public_id: 'test/file',
  resource_type: 'image',
});

export const deleteFromCloudinary = jest.fn().mockResolvedValue(undefined);

export const cloudinary = {
  config: jest.fn(),
  uploader: {
    upload_stream: jest.fn(),
    destroy: jest.fn(),
  },
};
