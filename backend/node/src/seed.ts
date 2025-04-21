import BinSchema from './schema/BinSchema';
import Compartment from './schema/CompartmentSchema';

async function seed() {
  const existing = await BinSchema.findOne({ name: 'Default Bin' });
  if (existing) {
    console.log('The default bin already exists');
    return; 
  }

  const bin = await BinSchema.create({
    name: 'Default Bin',
    latitude: 16.0544,
    longitude: 108.2022,
  });

  const types = ['plastic', 'paper', 'metal', 'trash'];
  await Promise.all(
    types.map(type =>
      Compartment.create({
        binId: bin._id,
        type,
        sensorId: `esp8266-${type}`,
      })
    )
  );

  console.log('Seed completed');
}

export default seed;
