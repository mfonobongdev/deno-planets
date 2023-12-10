import { parse } from "./deps.ts";

const results: Planet[] = [];

const file = await Deno.open("test_data.csv", { read: true });

await file.readable.pipeTo(writableStream());

//habitable planets
console.log(results.map((el) => {
  return { name: el.kepler_name };
}));

//count of habitable planets
console.log(results.length);

/* functions */
function writableStream() {
  return new WritableStream<Uint8Array>({
    // deno-lint-ignore require-await
    async write(chunk) {
      try {
        // Convert Uint8Array to string
        const chunkString = new TextDecoder().decode(chunk);

        // Process the chunk
        const records: Planet[] = parse(chunkString, {
          comment: "#",
          columns: true,
          delimiter: ",",
          trim: true,
          quote: false,
          skip_records_with_empty_values: true,
        });

        for (const record of records) {
          if (isHabitablePlanet(record)) {
            results.push(record);
          }
        }
      } catch (error) {
        console.error(`Error processing chunk: ${error.message}`);
      }
    },
  });
}

function isHabitablePlanet(planet: Planet) {
  const isNotTooCold = Number(planet.koi_insol) > 0.36;
  const isNotTooHot = Number(planet.koi_insol) < 1.11;
  const isNotTooBig = Number(planet.koi_prad) < 1.6;
  const isConfirmed = planet.koi_disposition === "CONFIRMED";

  return isNotTooCold && isNotTooHot && isNotTooBig && isConfirmed;
}

/* types */
type Planet = {
  "kepler_name": string;
  "koi_prad": string;
  "koi_insol": string;
  "koi_disposition": "CONFIRMED" | "CANDITADE" | "FALSE POSITIVE";
};
