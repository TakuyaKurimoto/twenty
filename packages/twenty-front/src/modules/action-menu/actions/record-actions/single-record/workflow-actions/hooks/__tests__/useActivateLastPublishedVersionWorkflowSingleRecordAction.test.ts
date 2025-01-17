import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { useActivateLastPublishedVersionWorkflowSingleRecordAction } from '../useActivateLastPublishedVersionWorkflowSingleRecordAction';

const workflowMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'workflow',
)!;

const workflowMock = {
  __typename: 'Workflow',
  id: 'workflowId',
  lastPublishedVersionId: 'lastPublishedVersionId',
  currentVersion: {
    __typename: 'WorkflowVersion',
    id: 'lastPublishedVersionId',
    trigger: 'trigger',
    status: 'DEACTIVATED',
    steps: [
      {
        __typename: 'WorkflowStep',
        id: 'stepId1',
      },
    ],
  },
};

jest.mock('@/workflow/hooks/useWorkflowWithCurrentVersion', () => ({
  useWorkflowWithCurrentVersion: () => workflowMock,
}));

const activateWorkflowVersionMock = jest.fn();

jest.mock('@/workflow/hooks/useActivateWorkflowVersion', () => ({
  useActivateWorkflowVersion: () => ({
    activateWorkflowVersion: activateWorkflowVersionMock,
  }),
}));

const wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: '1',
  contextStoreCurrentObjectMetadataNameSingular:
    workflowMockObjectMetadataItem.nameSingular,
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [workflowMock.id],
  },
  onInitializeRecoilSnapshot: (snapshot) => {
    snapshot.set(recordStoreFamilyState(workflowMock.id), workflowMock);
  },
});

describe('useActivateLastPublishedVersionWorkflowSingleRecordAction', () => {
  it('should be registered', () => {
    const { result } = renderHook(
      () =>
        useActivateLastPublishedVersionWorkflowSingleRecordAction({
          recordId: workflowMock.id,
        }),
      {
        wrapper,
      },
    );

    expect(result.current.shouldBeRegistered).toBe(true);
  });

  it('should call activateWorkflowVersion on click', () => {
    const { result } = renderHook(
      () =>
        useActivateLastPublishedVersionWorkflowSingleRecordAction({
          recordId: workflowMock.id,
        }),
      {
        wrapper,
      },
    );

    act(() => {
      result.current.onClick();
    });

    expect(activateWorkflowVersionMock).toHaveBeenCalledWith({
      workflowId: workflowMock.id,
      workflowVersionId: workflowMock.currentVersion.id,
    });
  });
});
