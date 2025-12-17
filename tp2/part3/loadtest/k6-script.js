import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// Mesure du temps de traitement côté client
const reqDur = new Trend('request_duration_ms');

// Cible configurable via variable d'environnement TARGET_URL
const TARGET = __ENV.TARGET_URL || 'http://host.docker.internal:3000/';

export let options = {
  // Scénario : envoie un nombre fixe d'itérations réparties sur des VUs
  scenarios: {
    load_test: {
      executor: 'shared-iterations',
      vus: __ENV.VUS ? parseInt(__ENV.VUS) : 50,
      iterations: __ENV.ITERATIONS ? parseInt(__ENV.ITERATIONS) : 1000,
      maxDuration: '10m',
    },
  },
  thresholds: {
    // Exemple : alerter si plus de 5% des requêtes > 2s
    'http_req_duration{type:all}': ['p(95)<2000'],
  },
};

export default function () {
  const res = http.get(TARGET);
  reqDur.add(res.timings.duration);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
