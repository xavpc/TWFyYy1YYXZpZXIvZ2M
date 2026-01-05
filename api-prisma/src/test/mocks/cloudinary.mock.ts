/**
 * Mock Cloudinary Service for Unit Testing
 * Provides mock implementations for Cloudinary operations
 */

export const mockCloudinaryService = {
  uploadImage: jest.fn().mockResolvedValue({
    public_id: 'mock-public-id-12345',
    secure_url: 'https://res.cloudinary.com/demo/image/upload/mock-image.jpg',
    url: 'http://res.cloudinary.com/demo/image/upload/mock-image.jpg',
    format: 'jpg',
    width: 800,
    height: 600,
    bytes: 102400,
    created_at: new Date().toISOString(),
  }),

  deleteImage: jest.fn().mockResolvedValue({
    result: 'ok',
  }),

  uploadBuffer: jest.fn().mockResolvedValue({
    public_id: 'mock-buffer-upload-id',
    secure_url: 'https://res.cloudinary.com/demo/image/upload/mock-buffer.jpg',
    url: 'http://res.cloudinary.com/demo/image/upload/mock-buffer.jpg',
    format: 'jpg',
    width: 800,
    height: 600,
    bytes: 51200,
    created_at: new Date().toISOString(),
  }),

  getImageUrl: jest.fn().mockReturnValue('https://res.cloudinary.com/demo/image/upload/mock-image.jpg'),
};

/**
 * Mock Multer file object for testing file uploads
 */
export const createMockMulterFile = (overrides?: Partial<Express.Multer.File>): Express.Multer.File => ({
  fieldname: 'file',
  originalname: 'test-image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 102400,
  buffer: Buffer.from('mock-image-content'),
  destination: '',
  filename: 'test-image.jpg',
  path: '',
  stream: null as any,
  ...overrides,
});

/**
 * Resets all Cloudinary mock implementations
 */
export function resetCloudinaryMocks() {
  Object.values(mockCloudinaryService).forEach((method) => {
    if (typeof method === 'function' && 'mockReset' in method) {
      (method as jest.Mock).mockReset();
    }
  });

  // Re-apply default implementations
  mockCloudinaryService.uploadImage.mockResolvedValue({
    public_id: 'mock-public-id-12345',
    secure_url: 'https://res.cloudinary.com/demo/image/upload/mock-image.jpg',
    url: 'http://res.cloudinary.com/demo/image/upload/mock-image.jpg',
    format: 'jpg',
    width: 800,
    height: 600,
    bytes: 102400,
    created_at: new Date().toISOString(),
  });

  mockCloudinaryService.deleteImage.mockResolvedValue({
    result: 'ok',
  });
}
