export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}

export function resetApiMocks() {
  mockApiClient.get.mockReset()
  mockApiClient.post.mockReset()
  mockApiClient.put.mockReset()
  mockApiClient.delete.mockReset()
  mockApiClient.patch.mockReset()
}

jest.mock('@/lib/api/client', () => ({
  apiClient: mockApiClient
}))
