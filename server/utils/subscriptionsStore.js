const subscriptionMap = new Map();

export const saveSubscription = (email, arn) => {
  subscriptionMap.set(email, arn);
};

export const getSubscriptionArn = (email) => {
  return subscriptionMap.get(email);
};

export const deleteSubscription = (email) => {
  subscriptionMap.delete(email);
};
