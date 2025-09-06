import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InsuranceService } from "../services";
import { queryKeys } from "../queryClient";
import {
  CreateInsurancePolicyRequest,
  InsurancePolicy,
  CreateInsuranceClaimRequest,
  InsuranceClaim,
} from "../../../types/shared";

// Insurance hooks
export const useCreateInsurancePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInsurancePolicyRequest) =>
      InsuranceService.createInsurancePolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insurance.policies });
    },
  });
};

export const useInsurancePolicy = (cargoId: string) => {
  return useQuery({
    queryKey: queryKeys.insurance.policy(cargoId),
    queryFn: () => InsuranceService.getInsurancePolicy(cargoId),
    select: (data) => data.data,
    enabled: !!cargoId,
  });
};

export const useUpdateInsurancePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      policyId,
      data,
    }: {
      policyId: string;
      data: Partial<InsurancePolicy>;
    }) => InsuranceService.updateInsurancePolicy(policyId, data),
    onSuccess: (_, { policyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.insurance.policy(policyId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.insurance.policies });
    },
  });
};

export const useDeleteInsurancePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) =>
      InsuranceService.deleteInsurancePolicy(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insurance.policies });
    },
  });
};

export const useAllInsurancePolicies = (params?: {
  cargo_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.insurance.policiesList(params),
    queryFn: () => InsuranceService.getAllInsurancePolicies(params),
    select: (data) => data.data,
  });
};

export const useFileInsuranceClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInsuranceClaimRequest) =>
      InsuranceService.fileInsuranceClaim(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insurance.claims });
    },
  });
};

export const useClaimStatus = (claimId: string) => {
  return useQuery({
    queryKey: queryKeys.insurance.claim(claimId),
    queryFn: () => InsuranceService.getClaimStatus(claimId),
    select: (data) => data.data,
    enabled: !!claimId,
  });
};

export const useAllInsuranceClaims = (params?: {
  cargo_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.insurance.claimsList(params),
    queryFn: () => InsuranceService.getAllInsuranceClaims(params),
    select: (data) => data.data,
  });
};

export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      claimId,
      status,
      notes,
    }: {
      claimId: string;
      status: string;
      notes?: string;
    }) => InsuranceService.updateClaimStatus(claimId, status, notes),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.insurance.claim(claimId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.insurance.claims });
    },
  });
};

export const useInsuranceProviders = () => {
  return useQuery({
    queryKey: queryKeys.insurance.providers,
    queryFn: () => InsuranceService.getInsuranceProviders(),
    select: (data) => data.data,
  });
};

export const useCalculatePremium = () => {
  return useMutation({
    mutationFn: (data: {
      cargo_value: number;
      cargo_type: string;
      distance_km: number;
      coverage_type: string;
    }) => InsuranceService.calculatePremium(data),
  });
};
