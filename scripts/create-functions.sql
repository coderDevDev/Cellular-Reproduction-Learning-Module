-- Function to increment occupied units when a tenant is added
CREATE OR REPLACE FUNCTION increment_occupied_units(property_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.properties 
  SET occupied_units = occupied_units + 1
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement occupied units when a tenant is removed
CREATE OR REPLACE FUNCTION decrement_occupied_units(property_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.properties 
  SET occupied_units = GREATEST(occupied_units - 1, 0)
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard stats for property owners
CREATE OR REPLACE FUNCTION get_owner_dashboard_stats(owner_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_properties', (
      SELECT COUNT(*) FROM public.properties WHERE owner_id = get_owner_dashboard_stats.owner_id
    ),
    'total_tenants', (
      SELECT COUNT(*) FROM public.tenants t
      JOIN public.properties p ON t.property_id = p.id
      WHERE p.owner_id = get_owner_dashboard_stats.owner_id
    ),
    'total_units', (
      SELECT COALESCE(SUM(total_units), 0) FROM public.properties 
      WHERE owner_id = get_owner_dashboard_stats.owner_id
    ),
    'occupied_units', (
      SELECT COALESCE(SUM(occupied_units), 0) FROM public.properties 
      WHERE owner_id = get_owner_dashboard_stats.owner_id
    ),
    'monthly_income', (
      SELECT COALESCE(SUM(t.monthly_rent), 0) FROM public.tenants t
      JOIN public.properties p ON t.property_id = p.id
      WHERE p.owner_id = get_owner_dashboard_stats.owner_id AND t.status = 'active'
    ),
    'properties_by_status', (
      SELECT json_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) as count
        FROM public.properties 
        WHERE owner_id = get_owner_dashboard_stats.owner_id
        GROUP BY status
      ) s
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
