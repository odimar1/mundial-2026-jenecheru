import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// World Cup 2026 Group Stage matches (48 matches)
const matches = [
  // Grupo A
  { matchNumber: 1, homeTeam: 'México', awayTeam: 'Nueva Zelanda', group: 'Grupo A', venue: 'Estadio Azteca, CDMX', date: '11 Jun 2026' },
  { matchNumber: 2, homeTeam: 'Canadá', awayTeam: 'Marruecos', group: 'Grupo A', venue: 'BMO Field, Toronto', date: '11 Jun 2026' },
  { matchNumber: 3, homeTeam: 'México', awayTeam: 'Marruecos', group: 'Grupo A', venue: 'Estadio Azteca, CDMX', date: '16 Jun 2026' },
  { matchNumber: 4, homeTeam: 'Canadá', awayTeam: 'Nueva Zelanda', group: 'Grupo A', venue: 'BMO Field, Toronto', date: '16 Jun 2026' },
  { matchNumber: 5, homeTeam: 'Nueva Zelanda', awayTeam: 'Marruecos', group: 'Grupo A', venue: 'BMO Field, Toronto', date: '21 Jun 2026' },
  { matchNumber: 6, homeTeam: 'Canadá', awayTeam: 'México', group: 'Grupo A', venue: 'BMO Field, Toronto', date: '21 Jun 2026' },

  // Grupo B
  { matchNumber: 7, homeTeam: 'Argentina', awayTeam: 'Suiza', group: 'Grupo B', venue: 'SoFi Stadium, Los Ángeles', date: '12 Jun 2026' },
  { matchNumber: 8, homeTeam: 'Paraguay', awayTeam: 'Haití', group: 'Grupo B', venue: 'Hard Rock Stadium, Miami', date: '12 Jun 2026' },
  { matchNumber: 9, homeTeam: 'Argentina', awayTeam: 'Haití', group: 'Grupo B', venue: 'SoFi Stadium, Los Ángeles', date: '17 Jun 2026' },
  { matchNumber: 10, homeTeam: 'Paraguay', awayTeam: 'Suiza', group: 'Grupo B', venue: 'Hard Rock Stadium, Miami', date: '17 Jun 2026' },
  { matchNumber: 11, homeTeam: 'Suiza', awayTeam: 'Haití', group: 'Grupo B', venue: 'Hard Rock Stadium, Miami', date: '22 Jun 2026' },
  { matchNumber: 12, homeTeam: 'Paraguay', awayTeam: 'Argentina', group: 'Grupo B', venue: 'Hard Rock Stadium, Miami', date: '22 Jun 2026' },

  // Grupo C
  { matchNumber: 13, homeTeam: 'Francia', awayTeam: 'Turquía', group: 'Grupo C', venue: 'MetLife Stadium, Nueva York', date: '12 Jun 2026' },
  { matchNumber: 14, homeTeam: 'Colombia', awayTeam: 'Suecia', group: 'Grupo C', venue: 'NRG Stadium, Houston', date: '12 Jun 2026' },
  { matchNumber: 15, homeTeam: 'Francia', awayTeam: 'Suecia', group: 'Grupo C', venue: 'MetLife Stadium, Nueva York', date: '17 Jun 2026' },
  { matchNumber: 16, homeTeam: 'Colombia', awayTeam: 'Turquía', group: 'Grupo C', venue: 'NRG Stadium, Houston', date: '17 Jun 2026' },
  { matchNumber: 17, homeTeam: 'Turquía', awayTeam: 'Suecia', group: 'Grupo C', venue: 'NRG Stadium, Houston', date: '22 Jun 2026' },
  { matchNumber: 18, homeTeam: 'Colombia', awayTeam: 'Francia', group: 'Grupo C', venue: 'NRG Stadium, Houston', date: '22 Jun 2026' },

  // Grupo D
  { matchNumber: 19, homeTeam: 'Brasil', awayTeam: 'Argelia', group: 'Grupo D', venue: 'Gillette Stadium, Boston', date: '13 Jun 2026' },
  { matchNumber: 20, homeTeam: 'Uruguay', awayTeam: 'Jordania', group: 'Grupo D', venue: 'Lumen Field, Seattle', date: '13 Jun 2026' },
  { matchNumber: 21, homeTeam: 'Brasil', awayTeam: 'Jordania', group: 'Grupo D', venue: 'Gillette Stadium, Boston', date: '18 Jun 2026' },
  { matchNumber: 22, homeTeam: 'Uruguay', awayTeam: 'Argelia', group: 'Grupo D', venue: 'Lumen Field, Seattle', date: '18 Jun 2026' },
  { matchNumber: 23, homeTeam: 'Argelia', awayTeam: 'Jordania', group: 'Grupo D', venue: 'Lumen Field, Seattle', date: '23 Jun 2026' },
  { matchNumber: 24, homeTeam: 'Uruguay', awayTeam: 'Brasil', group: 'Grupo D', venue: 'Lumen Field, Seattle', date: '23 Jun 2026' },

  // Grupo E
  { matchNumber: 25, homeTeam: 'Alemania', awayTeam: 'Australia', group: 'Grupo E', venue: 'AT&T Stadium, Dallas', date: '13 Jun 2026' },
  { matchNumber: 26, homeTeam: 'Países Bajos', awayTeam: 'Costa de Marfil', group: 'Grupo E', venue: 'Mercedes-Benz, Atlanta', date: '13 Jun 2026' },
  { matchNumber: 27, homeTeam: 'Alemania', awayTeam: 'Costa de Marfil', group: 'Grupo E', venue: 'AT&T Stadium, Dallas', date: '18 Jun 2026' },
  { matchNumber: 28, homeTeam: 'Países Bajos', awayTeam: 'Australia', group: 'Grupo E', venue: 'Mercedes-Benz, Atlanta', date: '18 Jun 2026' },
  { matchNumber: 29, homeTeam: 'Australia', awayTeam: 'Costa de Marfil', group: 'Grupo E', venue: 'Mercedes-Benz, Atlanta', date: '23 Jun 2026' },
  { matchNumber: 30, homeTeam: 'Países Bajos', awayTeam: 'Alemania', group: 'Grupo E', venue: 'Mercedes-Benz, Atlanta', date: '23 Jun 2026' },

  // Grupo F
  { matchNumber: 31, homeTeam: 'España', awayTeam: 'Egipto', group: 'Grupo F', venue: 'SoFi Stadium, Los Ángeles', date: '14 Jun 2026' },
  { matchNumber: 32, homeTeam: 'Croacia', awayTeam: 'Irán', group: 'Grupo F', venue: 'Soldier Field, Chicago', date: '14 Jun 2026' },
  { matchNumber: 33, homeTeam: 'España', awayTeam: 'Irán', group: 'Grupo F', venue: 'SoFi Stadium, Los Ángeles', date: '19 Jun 2026' },
  { matchNumber: 34, homeTeam: 'Croacia', awayTeam: 'Egipto', group: 'Grupo F', venue: 'Soldier Field, Chicago', date: '19 Jun 2026' },
  { matchNumber: 35, homeTeam: 'Irán', awayTeam: 'Egipto', group: 'Grupo F', venue: 'Soldier Field, Chicago', date: '24 Jun 2026' },
  { matchNumber: 36, homeTeam: 'Croacia', awayTeam: 'España', group: 'Grupo F', venue: 'Soldier Field, Chicago', date: '24 Jun 2026' },

  // Grupo G
  { matchNumber: 37, homeTeam: 'Inglaterra', awayTeam: 'Sudáfrica', group: 'Grupo G', venue: 'MetLife Stadium, Nueva York', date: '14 Jun 2026' },
  { matchNumber: 38, homeTeam: 'Portugal', awayTeam: 'Túnez', group: 'Grupo G', venue: 'Ford Field, Detroit', date: '14 Jun 2026' },
  { matchNumber: 39, homeTeam: 'Inglaterra', awayTeam: 'Túnez', group: 'Grupo G', venue: 'MetLife Stadium, Nueva York', date: '19 Jun 2026' },
  { matchNumber: 40, homeTeam: 'Portugal', awayTeam: 'Sudáfrica', group: 'Grupo G', venue: 'Ford Field, Detroit', date: '19 Jun 2026' },
  { matchNumber: 41, homeTeam: 'Sudáfrica', awayTeam: 'Túnez', group: 'Grupo G', venue: 'Ford Field, Detroit', date: '24 Jun 2026' },
  { matchNumber: 42, homeTeam: 'Portugal', awayTeam: 'Inglaterra', group: 'Grupo G', venue: 'Ford Field, Detroit', date: '24 Jun 2026' },

  // Grupo H
  { matchNumber: 43, homeTeam: 'Estados Unidos', awayTeam: 'Bélgica', group: 'Grupo H', venue: 'SoFi Stadium, Los Ángeles', date: '15 Jun 2026' },
  { matchNumber: 44, homeTeam: 'Japón', awayTeam: 'Senegal', group: 'Grupo H', venue: 'Camping World, Orlando', date: '15 Jun 2026' },
  { matchNumber: 45, homeTeam: 'Estados Unidos', awayTeam: 'Senegal', group: 'Grupo H', venue: 'SoFi Stadium, Los Ángeles', date: '20 Jun 2026' },
  { matchNumber: 46, homeTeam: 'Japón', awayTeam: 'Bélgica', group: 'Grupo H', venue: 'Camping World, Orlando', date: '20 Jun 2026' },
  { matchNumber: 47, homeTeam: 'Senegal', awayTeam: 'Bélgica', group: 'Grupo H', venue: 'Camping World, Orlando', date: '25 Jun 2026' },
  { matchNumber: 48, homeTeam: 'Japón', awayTeam: 'Estados Unidos', group: 'Grupo H', venue: 'Camping World, Orlando', date: '25 Jun 2026' },

  // Grupo I
  { matchNumber: 49, homeTeam: 'Italia', awayTeam: 'Noruega', group: 'Grupo I', venue: 'Lincoln Financial, Filadelfia', date: '15 Jun 2026' },
  { matchNumber: 50, homeTeam: 'Corea del Sur', awayTeam: 'Escocia', group: 'Grupo I', venue: 'Levi\'s Stadium, San Francisco', date: '15 Jun 2026' },
  { matchNumber: 51, homeTeam: 'Italia', awayTeam: 'Escocia', group: 'Grupo I', venue: 'Lincoln Financial, Filadelfia', date: '20 Jun 2026' },
  { matchNumber: 52, homeTeam: 'Corea del Sur', awayTeam: 'Noruega', group: 'Grupo I', venue: 'Levi\'s Stadium, San Francisco', date: '20 Jun 2026' },
  { matchNumber: 53, homeTeam: 'Noruega', awayTeam: 'Escocia', group: 'Grupo I', venue: 'Levi\'s Stadium, San Francisco', date: '25 Jun 2026' },
  { matchNumber: 54, homeTeam: 'Corea del Sur', awayTeam: 'Italia', group: 'Grupo I', venue: 'Levi\'s Stadium, San Francisco', date: '25 Jun 2026' },

  // Grupo J
  { matchNumber: 55, homeTeam: 'Dinamarca', awayTeam: 'Arabia Saudita', group: 'Grupo J', venue: 'TQL Stadium, Cincinnati', date: '15 Jun 2026' },
  { matchNumber: 56, homeTeam: 'Chequia', awayTeam: 'Ghana', group: 'Grupo J', venue: 'Bank of America, Charlotte', date: '15 Jun 2026' },
  { matchNumber: 57, homeTeam: 'Dinamarca', awayTeam: 'Ghana', group: 'Grupo J', venue: 'TQL Stadium, Cincinnati', date: '20 Jun 2026' },
  { matchNumber: 58, homeTeam: 'Chequia', awayTeam: 'Arabia Saudita', group: 'Grupo J', venue: 'Bank of America, Charlotte', date: '20 Jun 2026' },
  { matchNumber: 59, homeTeam: 'Arabia Saudita', awayTeam: 'Ghana', group: 'Grupo J', venue: 'Bank of America, Charlotte', date: '25 Jun 2026' },
  { matchNumber: 60, homeTeam: 'Chequia', awayTeam: 'Dinamarca', group: 'Grupo J', venue: 'Bank of America, Charlotte', date: '25 Jun 2026' },

  // Grupo K
  { matchNumber: 61, homeTeam: 'Polonia', awayTeam: 'Ecuador', group: 'Grupo K', venue: 'GEHA Field, Kansas City', date: '16 Jun 2026' },
  { matchNumber: 62, homeTeam: 'Serbia', awayTeam: 'Panamá', group: 'Grupo K', venue: 'Arrowhead, Kansas City', date: '16 Jun 2026' },
  { matchNumber: 63, homeTeam: 'Polonia', awayTeam: 'Panamá', group: 'Grupo K', venue: 'GEHA Field, Kansas City', date: '21 Jun 2026' },
  { matchNumber: 64, homeTeam: 'Serbia', awayTeam: 'Ecuador', group: 'Grupo K', venue: 'Arrowhead, Kansas City', date: '21 Jun 2026' },
  { matchNumber: 65, homeTeam: 'Ecuador', awayTeam: 'Panamá', group: 'Grupo K', venue: 'Arrowhead, Kansas City', date: '26 Jun 2026' },
  { matchNumber: 66, homeTeam: 'Serbia', awayTeam: 'Polonia', group: 'Grupo K', venue: 'Arrowhead, Kansas City', date: '26 Jun 2026' },

  // Grupo L
  { matchNumber: 67, homeTeam: 'Ucrania', awayTeam: 'Irak', group: 'Grupo L', venue: 'NRG Stadium, Houston', date: '16 Jun 2026' },
  { matchNumber: 68, homeTeam: 'Austria', awayTeam: 'Curazao', group: 'Grupo L', venue: 'Audi Field, Washington D.C.', date: '16 Jun 2026' },
  { matchNumber: 69, homeTeam: 'Ucrania', awayTeam: 'Curazao', group: 'Grupo L', venue: 'NRG Stadium, Houston', date: '21 Jun 2026' },
  { matchNumber: 70, homeTeam: 'Austria', awayTeam: 'Irak', group: 'Grupo L', venue: 'Audi Field, Washington D.C.', date: '21 Jun 2026' },
  { matchNumber: 71, homeTeam: 'Irak', awayTeam: 'Curazao', group: 'Grupo L', venue: 'Audi Field, Washington D.C.', date: '26 Jun 2026' },
  { matchNumber: 72, homeTeam: 'Austria', awayTeam: 'Ucrania', group: 'Grupo L', venue: 'Audi Field, Washington D.C.', date: '26 Jun 2026' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('activofijo26', 10);
  const admin = await prisma.user.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@jenecheru.com',
      password: adminPassword,
      isAdmin: true,
      isConfirmed: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.name}`);

  // Create app settings
  await prisma.appSetting.upsert({
    where: { key: 'predictionsLocked' },
    update: {},
    create: { key: 'predictionsLocked', value: 'false' },
  });
  console.log('✅ App settings created');

  // Create matches
  for (const match of matches) {
    await prisma.match.upsert({
      where: { matchNumber: match.matchNumber },
      update: {},
      create: match,
    });
  }
  console.log(`✅ ${matches.length} matches created`);

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
