import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { AppShell } from './components/layout/AppShell';
import { ApplicationsList } from './screens/applications/ApplicationsList';
import { DocumentChecklist } from './screens/checklist/DocumentChecklist';
import { GapCheckResults } from './screens/gapCheck/GapCheckResults';
import { ExtractionReview } from './screens/extraction/ExtractionReview';
import { SpreadingSheet } from './screens/sheet/SpreadingSheet';
import { CreditSignOff } from './screens/signOff/CreditSignOff';
import { AuditLogTable } from './screens/auditLog/AuditLogTable';
import { MetricsDashboard } from './screens/dashboard/MetricsDashboard';
import { ROLES } from './roles/roles';
import { SCREENS } from './components/layout/Sidebar';

export const App: React.FC = () => {
  const [state, setState] = useState(store.getState());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    return unsubscribe;
  }, []);

  // Keyboard navigation shortcuts [1-9]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (SCREENS[idx]) store.setScreen(SCREENS[idx].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const activeApp = state.applications.find(a => a.id === state.activeCaseId) || state.applications[0];
  const activeDocs = state.documents[state.activeCaseId] || [];
  const activeFigures = state.extractions[state.activeCaseId] || [];

  return (
    <AppShell
      currentRole={state.currentRole}
      onRoleChange={role => store.setRole(role)}
      currentScreen={state.currentScreen}
      onScreenChange={screen => store.setScreen(screen)}
      applications={state.applications}
      activeCaseId={state.activeCaseId}
      onCaseChange={caseId => store.setActiveCase(caseId)}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      {state.currentScreen === 'applications' && (
        <ApplicationsList
          applications={state.applications}
          activeCaseId={state.activeCaseId}
          onSelectCase={caseId => {
            store.setActiveCase(caseId);
            store.setScreen('checklist');
          }}
        />
      )}

      {state.currentScreen === 'checklist' && (
        <DocumentChecklist
          application={activeApp}
          documents={activeDocs}
          currentRole={state.currentRole}
          onSimulateUpload={() => {
            const missing = activeDocs.find(d => d.status === 'Missing');
            if (missing) {
              missing.status = 'Received';
              missing.fileName = `${missing.type}_verified.pdf`;
              store.save();
              alert(`Simulated upload for: ${missing.title}`);
            } else {
              alert('All documents are already uploaded.');
            }
          }}
          onSendConsolidatedRequest={() => {
            activeApp.requestSentCount = (activeApp.requestSentCount || 0) + 1;
            activeApp.status = 'Documents Needed';
            store.logger.record(
              'CONSOLIDATED_REQUEST_GENERATED',
              activeApp.id,
              ROLES[state.currentRole].name,
              state.currentRole,
              `Consolidated request generated for ${activeApp.applicant}. Total rounds: ${activeApp.requestSentCount}.`
            );
            store.save();
            alert('Consolidated request logged to audit trail.');
          }}
        />
      )}

      {state.currentScreen === 'gapCheck' && (
        <GapCheckResults
          application={activeApp}
          documents={activeDocs}
        />
      )}

      {state.currentScreen === 'extraction' && (
        <ExtractionReview
          application={activeApp}
          figures={activeFigures}
          currentRole={state.currentRole}
          onConfirmFigure={figId => {
            store.confirmFigure(figId, ROLES[state.currentRole].name);
          }}
          onOverrideFigure={(figId, val, reason) => {
            store.overrideFigure(figId, val, reason, ROLES[state.currentRole].name);
          }}
        />
      )}

      {state.currentScreen === 'analyst' && (
        <ExtractionReview
          application={activeApp}
          figures={activeFigures}
          currentRole={state.currentRole}
          onConfirmFigure={figId => {
            store.confirmFigure(figId, ROLES[state.currentRole].name);
          }}
          onOverrideFigure={(figId, val, reason) => {
            store.overrideFigure(figId, val, reason, ROLES[state.currentRole].name);
          }}
        />
      )}

      {state.currentScreen === 'sheet' && (
        <SpreadingSheet
          application={activeApp}
          figures={activeFigures}
        />
      )}

      {state.currentScreen === 'signOff' && (
        <CreditSignOff
          application={activeApp}
          currentRole={state.currentRole}
          onRecordSignOff={(decision, notes) => {
            store.recordSignOff(decision, notes, ROLES[state.currentRole].name);
            alert(`Decision recorded: ${decision}`);
          }}
        />
      )}

      {state.currentScreen === 'auditLog' && (
        <AuditLogTable
          entries={state.auditLog}
        />
      )}

      {state.currentScreen === 'dashboard' && (
        <MetricsDashboard
          onResetDemoData={() => {
            store.reset();
            alert('Demo data reset to initial seed values.');
          }}
        />
      )}
    </AppShell>
  );
};
