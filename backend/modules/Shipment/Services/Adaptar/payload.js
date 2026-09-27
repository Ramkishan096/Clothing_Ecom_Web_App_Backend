const toNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }

  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

export const buildShiprocketPayload = (data) => {
  console.log("hit function buildshiprocketpayoload...");
  // console.log("order items in shiprocket payload", data.order_items);
  // console.log("-------------",data.payment_method?.toLowerCase())
  const payment_method = data.payment_method?.toLowerCase() === "cod" ? "COD" : "Prepaid";
  console.log("payment method:", payment_method);
  return {
    order_id: data.order_id,
    order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
    pickup_location: "home",
    // pickup_location: "Home",
    // ───── Billing / Shipping ─────
    billing_customer_name: data.shippingAddress.first_name,
    billing_last_name: data.shippingAddress.last_name,

    billing_address: data.shippingAddress.address,
    billing_address_2:"",
    billing_city: data.shippingAddress.city || "",
    billing_pincode: toNumber(data.shippingAddress.pincode),
    billing_state: data.shippingAddress.state || "",
    billing_country:"India",

    billing_email: data.shippingAddress.email || "",
    billing_phone: toNumber(data.shippingAddress.phone),
    shipping_is_billing:true,

    // ───── Can be multiple Product Only ─────


    order_items: data.items.map((item) => ({
      name: item.product_name,
      sku: item.product_id,
      units: toNumber(item.quantity),
      selling_price: toNumber(item.mrp_price),
      discount: toNumber(item.mrp_price-item.selling_price) || "",
      // tax: toNumber(item.tax) || "12",
      // hsn: item.hsn || "6109",
    })),
    // ───── Payment ─────
    payment_method: payment_method,
    shipping_charges: toNumber(data.shipping_charge) || 0, // Shipping charges if any in Rupee.
    // giftwrap_charges:toNumber(5),
    transaction_charges:toNumber(data.cod_charge),    
    // total_discount: toNumber(data.total_discount) || "", // The total discount amount in Rupee.
    sub_total: toNumber(data.sub_total-data.total_discount) || 0,
    // ───── Package Dimensions ─────
    length: toNumber(data?.length || 20),
    breadth: toNumber(data?.breadth || 20),
    height: toNumber(data?.height || 5),
    weight: toNumber(data?.weight || 0.5),
  };
};
