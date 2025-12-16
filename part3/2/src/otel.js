const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { Resource } = require('@opentelemetry/resources');
const { SEMRESATTRS_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

console.log('OpenTelemetry loaded');

// Configure the trace exporter for Grafana Tempo
const traceExporter = new OTLPTraceExporter({
  // Comment ça c'est dégueu de mettre l'IP/le nom en statique dans le code ? Allez vous plaidre à mon LLM ! hihi
  url: 'http://tempo:4318/v1/traces',
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'shitty-webapp-tp1',
    'version': '1.0.0',
    'environment': process.env.NODE_ENV || 'development'
  }),
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [getNodeAutoInstrumentations({
    // Customize instrumentation to better capture Express routes
    '@opentelemetry/instrumentation-express': {
      // This ensures route names are captured
      requestHook: (span, request) => {
        span.setAttribute('http.route', request.route?.path || request.path);
      }
    },
    '@opentelemetry/instrumentation-http': {
      // Capture detailed HTTP info
      requestHook: (span, request) => {
        span.setAttribute('http.client_ip', request.headers['x-forwarded-for'] || request.socket?.remoteAddress);
      }
    }
  })]
});

sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('OpenTelemetry terminated'))
    .catch((error) => console.log('Error terminating OpenTelemetry', error))
    .finally(() => process.exit(0));
});
