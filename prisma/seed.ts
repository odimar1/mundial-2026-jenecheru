import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const groups: Record<string, string[]> = {
  A: ['México', 'Sudáfrica', 'Corea del Sur', 'Chequia'],
  B: ['Canadá', 'Bosnia y Herzegovina', 'Qatar', 'Suiza'],
  C: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
  D: ['Estados Unidos', 'Paraguay', 'Australia', 'Turquía'],
  E: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'],
  F: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
  G: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
  H: ['España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay'],
  I: ['Francia', 'Senegal', 'Irak', 'Noruega'],
  J: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  K: ['Portugal', 'RD Congo', 'Uzbekistán', 'Colombia'],
  L: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
};

const venues: Record<string, string[]> = {
  A: ['Estadio Azteca, CDMX', 'Estadio Akron, Guadalajara', 'Estadio Azteca, CDMX', 'Estadio BBVA, Monterrey', 'Estadio Akron, Guadalajara', 'Estadio BBVA, Monterrey'],
  B: ['BMO Field, Toronto', 'BMO Field, Toronto', 'BC Place, Vancouver', 'BMO Field, Toronto', 'BC Place, Vancouver', 'BC Place, Vancouver'],
  C: ['SoFi Stadium, Los Ángeles', 'SoFi Stadium, Los Ángeles', 'Levi\'s Stadium, San Francisco', 'SoFi Stadium, Los Ángeles', 'Levi\'s Stadium, San Francisco', 'Levi\'s Stadium, San Francisco'],
  D: ['MetLife Stadium, Nueva York', 'MetLife Stadium, Nueva York', 'Gillette Stadium, Boston', 'MetLife Stadium, Nueva York', 'Gillette Stadium, Boston', 'Gillette Stadium, Boston'],
  E: ['AT&T Stadium, Dallas', 'AT&T Stadium, Dallas', 'NRG Stadium, Houston', 'AT&T Stadium, Dallas', 'NRG Stadium, Houston', 'NRG Stadium, Houston'],
  F: ['Lumen Field, Seattle', 'Lumen Field, Seattle', 'Rose Bowl, Los Ángeles', 'Lumen Field, Seattle', 'Rose Bowl, Los Ángeles', 'Rose Bowl, Los Ángeles'],
  G: ['Mercedes-Benz Stadium, Atlanta', 'Mercedes-Benz Stadium, Atlanta', 'Hard Rock Stadium, Miami', 'Mercedes-Benz Stadium, Atlanta', 'Hard Rock Stadium, Miami', 'Hard Rock Stadium, Miami'],
  H: ['Lincoln Financial Field, Filadelfia', 'Lincoln Financial Field, Filadelfia', 'Arrowhead Stadium, Kansas City', 'Lincoln Financial Field, Filadelfia', 'Arrowhead Stadium, Kansas City', 'Arrowhead Stadium, Kansas City'],
  I: ['Soldier Field, Chicago', 'Soldier Field, Chicago', 'Auditorio Municipal, Kansas City', 'Soldier Field, Chicago', 'Auditorio Municipal, Kansas City', 'Auditorio Municipal, Kansas City'],
  J: ['Estadio BBVA, Monterrey', 'Estadio Akron, Guadalajara', 'Estadio BBVA, Monterrey', 'Estadio Akron, Guadalajara', 'Estadio BBVA, Monterrey', 'Estadio Akron, Guadalajara'],
  K: ['Allegiant Stadium, Las Vegas', 'Allegiant Stadium, Las Vegas', 'State Farm Stadium, Phoenix', 'Allegiant Stadium, Las Vegas', 'State Farm Stadium, Phoenix', 'State Farm Stadium, Phoenix'],
  L: ['NRG Stadium, Houston', 'Mercedes-Benz Stadium, Atlanta', 'Hard Rock Stadium, Miami', 'NRG Stadium, Houston', 'Mercedes-Benz Stadium, Atlanta', 'Hard Rock Stadium, Miami'],
};

// Match dates starting June 11, 2026
function getMatchDates(): string[] {
  const dates: string[] = [];
  const baseDate = new Date(2026, 5, 11); // June 11, 2026
  const times = ['13:00', '16:00', '19:00'];
  
  for (let day = 0; day < 18; day++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() + day);
    for (const time of times) {
      dates.push(`${currentDate.getDate()} de ${currentDate.getMonth() === 5 ? 'Junio' : 'Julio'}, 2026 - ${time}`);
    }
  }
  
  return dates;
}

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('activofijo26', 10);
  await prisma.user.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@jenecheru26.com',
      password: hashedPassword,
      isAdmin: true,
      isConfirmed: true,
    },
  });
  console.log('Admin user created');

  // Create app settings
  await prisma.appSetting.upsert({
    where: { key: 'predictionsLocked' },
    update: {},
    create: { key: 'predictionsLocked', value: 'false' },
  });
  console.log('App settings created');

  // Create matches
  const matchDates = getMatchDates();
  let matchNumber = 1;
  let dateIndex = 0;

  for (const [group, teams] of Object.entries(groups)) {
    const [t1, t2, t3, t4] = teams;
    const groupVenue = venues[group];
    
    // Matchday 1: t1 vs t2, t3 vs t4
    // Matchday 2: t1 vs t3, t2 vs t4
    // Matchday 3: t1 vs t4, t2 vs t3
    const matches = [
      { home: t1, away: t2, venue: groupVenue[0] },
      { home: t3, away: t4, venue: groupVenue[1] },
      { home: t1, away: t3, venue: groupVenue[2] },
      { home: t2, away: t4, venue: groupVenue[3] },
      { home: t1, away: t4, venue: groupVenue[4] },
      { home: t2, away: t3, venue: groupVenue[5] },
    ];

    for (const match of matches) {
      await prisma.match.create({
        data: {
          matchNumber,
          homeTeam: match.home,
          awayTeam: match.away,
          group: `Grupo ${group}`,
          venue: match.venue,
          date: matchDates[dateIndex] || 'Fecha por confirmar',
        },
      });
      matchNumber++;
      dateIndex++;
    }
  }

  console.log(`Created ${matchNumber - 1} matches`);
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
