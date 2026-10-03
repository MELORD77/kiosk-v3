import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { DemoLabelInput } from '../model/demo-label-schema';
import { requestDemoProfiles, submitDemoLabel } from './demo-adapter';
import type { DemoScenario } from './demo-adapter';

export const demoProfileKeys = {
  all: ['session', 'core-demo', 'profiles'] as const,
  list: (scenario: DemoScenario) => [...demoProfileKeys.all, scenario] as const,
};

export function useDemoProfiles(scenario: DemoScenario) {
  return useQuery({
    queryKey: demoProfileKeys.list(scenario),
    queryFn: ({ signal }) => requestDemoProfiles(scenario, signal),
    meta: { sessionOwned: true },
    retry: false,
  });
}

export function useSubmitDemoLabel(signal?: AbortSignal) {
  const queryClient = useQueryClient();
  const controllers = useRef(new Set<AbortController>());

  useEffect(() => {
    const activeControllers = controllers.current;
    return () => {
      activeControllers.forEach((controller) => controller.abort());
      activeControllers.clear();
    };
  }, []);

  return useMutation({
    mutationKey: ['session', 'core-demo', 'submit-label'],
    meta: { sessionOwned: true },
    mutationFn: async (input: DemoLabelInput) => {
      const controller = new AbortController();
      controllers.current.add(controller);
      try {
        const requestSignal = signal
          ? AbortSignal.any([signal, controller.signal])
          : controller.signal;
        return await submitDemoLabel(input, requestSignal);
      } finally {
        controllers.current.delete(controller);
      }
    },
    onSuccess: () => {
      if (!signal?.aborted) {
        return queryClient.invalidateQueries({ queryKey: demoProfileKeys.all });
      }
    },
    retry: false,
  });
}
