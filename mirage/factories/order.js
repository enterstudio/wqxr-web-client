import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  fund: () => faker.random.arrayElement(["WNYC", "WQXR", "Radiolab"]),
  orderPrice: () => faker.random.arrayElement([60, 72, 120, 12, 90, 100]),
  orderDate: faker.date.past(),
  orderType: () => faker.random.arrayElement(["onetime", "sustainer"]),
  orderKey: () => faker.random.uuid(),
  orderCode: () => faker.random.uuid(),
  premium: () => faker.random.arrayElement(['Brian Lehrer Animated Series', 'BL Mug', 'WNYC Hoodie', '']),
  creditCardType: () => faker.random.arrayElement(['Visa', 'Mastercard', 'Amex', 'Discover']),
  creditCardLast4Digits: '0302',
  isActiveMember: faker.random.boolean,
  isSustainer: faker.random.boolean,
});
