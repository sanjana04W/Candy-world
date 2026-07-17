// Integrations Helper for Candy World (EmailJS, Meta & TikTok Pixels)
import emailjs from "@emailjs/browser";

const getSettingsSync = () => {
  if (typeof window === "undefined") return {};
  try {
    const val = localStorage.getItem("candy_world_settings");
    if (val) return JSON.parse(val);
  } catch (e) {
    console.error("Failed to parse settings sync", e);
  }
  // Sensible fallbacks
  return {
    metaPixelId: "FB-1234567890",
    tiktokPixelId: "TT-1234567890",
    emailjsServiceId: "service_wanl11i",
    emailjsTemplateId: "template_j03vo2h",
    emailjsVerifyTemplateId: "template_j03vo2h",
    emailjsPublicKey: "OyFOVHnKDcQ3-Iqs8"
  };
};

export const initPixels = () => {
  if (typeof window === "undefined") return;
  const settings = getSettingsSync();

  // Mock initializers if scripts are not injected in layout yet
  if (!window.fbq) {
    window.fbq = function (...args) {
      console.log(`➡️ [Meta Pixel Event] (${settings.metaPixelId || "FB-1234567890"}):`, ...args);
    };
  }
  if (!window.ttq) {
    window.ttq = {
      track: function (event, data) {
        console.log(`➡️ [TikTok Pixel Event] (${settings.tiktokPixelId || "TT-1234567890"}):`, event, data);
      }
    };
  }
};

export const triggerPixelEvent = (eventName, data = {}) => {
  if (typeof window === "undefined") return;
  initPixels();
  
  try {
    window.fbq("track", eventName, data);
    window.ttq.track(eventName, data);
  } catch (e) {
    console.error("Pixel tracking error:", e);
  }
};

export const sendOrderNotificationEmail = async (order) => {
  const settings = getSettingsSync();
  const serviceId = settings.emailjsServiceId || "service_wanl11i";
  const templateId = settings.emailjsTemplateId || "template_j03vo2h";
  const publicKey = settings.emailjsPublicKey || "OyFOVHnKDcQ3-Iqs8";

  console.log(`➡️ [EmailJS Trigger] (${serviceId}): Dispatching transaction email to`, order.customerInfo.email);
  
  const templateParams = {
    order_number: order.orderNumber || order.orderId,
    customer_name: order.customerInfo.name,
    customer_phone: order.customerInfo.phone,
    customer_email: order.customerInfo.email,
    shipping_address: `${order.customerInfo.address}, ${order.customerInfo.district}`,
    order_total: `LKR ${order.totalAmount.toLocaleString()}`,
    items_list: order.items.map(i => `${i.name} (x${i.quantity})`).join(", ")
  };

  try {
    await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );
    console.log("EmailJS order notification successfully sent!");
    return true;
  } catch (error) {
    console.warn("EmailJS notification failed, using console fallback:", error);
    return false;
  }
};

export const sendVerificationCodeEmail = async (email, name, code) => {
  const settings = getSettingsSync();
  const serviceId = settings.emailjsServiceId || "service_wanl11i";
  const templateId = settings.emailjsVerifyTemplateId || "template_j03vo2h";
  const publicKey = settings.emailjsPublicKey || "OyFOVHnKDcQ3-Iqs8";

  console.log(`➡️ [EmailJS Verify] (${serviceId}): Dispatching verification code ${code} to`, email);
  
  const templateParams = {
    to_email: email,
    customer_name: name,
    verification_code: code
  };

  try {
    await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );
    console.log("EmailJS verification code sent successfully!");
    return true;
  } catch (error) {
    console.warn("EmailJS verification code failed, using console fallback:", error);
    return false;
  }
};
