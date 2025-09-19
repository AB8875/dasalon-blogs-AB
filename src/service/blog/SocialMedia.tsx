import axiosClient from "../AxiosClient";

export const socialMediaLink = async () => {
  const res = await axiosClient.get(`/social-media`);
  return res.data;
};

export const subscribeSalon = async (payload: { email: string }) => {
  const res = await axiosClient.post(`/subscribers`, {
    data: payload,
  });
  return res.data;
};
