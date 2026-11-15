/**
 * ABDM HFR adapter stub — needs ABDM sandbox approval before live calls.
 * TODO: implement facility lookup once credentials are approved.
 */
export interface AbdmFacilityStub {
  id: string;
  name: string;
}

export async function lookupAbdmFacility(_query: string): Promise<AbdmFacilityStub | null> {
  // TODO: ABDM sandbox integration
  return null;
}
