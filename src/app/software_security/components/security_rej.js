import React from 'react';
import { SecuritySummary } from '../securityConfig';

export default async function SecuritySummaryRejected() {
  return <SecuritySummary statusType="Rejected" />;
}