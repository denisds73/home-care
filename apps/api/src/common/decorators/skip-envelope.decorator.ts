import { SetMetadata } from '@nestjs/common';

export const SKIP_ENVELOPE_KEY = 'skipEnvelope';

/** Bypass the global ResponseEnvelopeInterceptor for this handler. */
export const SkipEnvelope = () => SetMetadata(SKIP_ENVELOPE_KEY, true);
