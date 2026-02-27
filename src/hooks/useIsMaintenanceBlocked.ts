import { useMaintenanceStore } from '@/store/maintenanceStore';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/enums';

/**
 * Returns true when the system is in maintenance mode AND the current user
 * is not SUPERADMIN. Use to disable mutation buttons and show tooltips.
 */
export function useIsMaintenanceBlocked(): boolean {
  const maintenanceMode = useMaintenanceStore((s) => s.maintenanceMode);
  const user = useAuthStore((s) => s.user);

  if (!maintenanceMode) return false;
  if (user?.role === UserRole.SUPERADMIN) return false;
  return true;
}
