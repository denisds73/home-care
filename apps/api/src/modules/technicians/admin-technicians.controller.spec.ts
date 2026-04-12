import { TechnicianEntity, TechnicianStatus } from '@/database/entities';
import { AdminTechniciansController } from './admin-technicians.controller';
import { TechniciansService } from './technicians.service';

describe('AdminTechniciansController', () => {
  const mockService = {
    listByVendor: jest.fn<
      Promise<TechnicianEntity[]>,
      [string]
    >(),
  } as unknown as TechniciansService & {
    listByVendor: jest.Mock;
  };

  const controller = new AdminTechniciansController(
    mockService as TechniciansService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to TechniciansService.listByVendor with the path param', async () => {
    const fixture: TechnicianEntity[] = [
      {
        id: 't-1',
        vendor_id: 'v-1',
        full_name: 'Demo Tech',
        phone: '+91',
        email: 'tech@demo.com',
        skills: ['ac'],
        status: TechnicianStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      } as TechnicianEntity,
    ];
    (mockService.listByVendor as jest.Mock).mockResolvedValueOnce(fixture);

    const result = await controller.listByVendor('v-1');

    expect(mockService.listByVendor).toHaveBeenCalledWith('v-1');
    expect(result).toBe(fixture);
  });

  it('returns an empty list when the vendor has no technicians', async () => {
    (mockService.listByVendor as jest.Mock).mockResolvedValueOnce([]);
    const result = await controller.listByVendor('v-empty');
    expect(result).toEqual([]);
  });
});
