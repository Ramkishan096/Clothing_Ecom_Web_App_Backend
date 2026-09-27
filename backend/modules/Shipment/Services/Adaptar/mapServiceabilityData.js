
export const mapServiceabilityAndCourierRate = (data) => {
  return {
    shipingCharge: data?.freight_charge,
    codCharges: data?.cod_charges,
    rtoCharges: data?.rto_charges || 0,
    expectedDeliveryDate: data?.etd,
    expectedDeliveryDays: data?.estimated_delivery_days,
    courierName: data?.courier_name,
    courierId: data?.courier_id ||  data?.courier_company_id || null,
    // raw: data,
  };
};