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
import { LLMObservability } from './screens/observability/LLMObservability';
import { LoginScreen } from './screens/auth/LoginScreen';
import { AuthService } from './services/auth';
import type { AuthUser } from './domain/types';
import { ROLES } from './roles/roles';
import { SCREENS } from './components/layout/Sidebar';
import { ToastProvider, useToast } from './components/ui/Toast';

const AppContent: React.FC = () => {
  const [state, setState] = useState(store.getState());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [authSession, setAuthSession] = useState<{ isAuthenticated: boolean; currentUser: AuthUser | null }>(
    AuthService.getInitialSession()
  );
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    return unsubscribe;
  }, []);

  // Keyboard navigation shortcuts [1-9, 0]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (SCREENS[idx]) store.setScreen(SCREENS[idx].id);
      } else if (e.key === '0') {
        store.setScreen('observability');
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

  const handleLogout = () => {
    AuthService.logout();
    setAuthSession({ isAuthenticated: false, currentUser: null });
    showToast('info', 'Signed Out', 'Your session has been terminated securely.');
  };

  // If not authenticated, render LoginScreen
  if (!authSession.isAuthenticated || !authSession.currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={user => {
          setAuthSession({ isAuthenticated: true, currentUser: user });
          store.setRole(user.role);
          if (user.role === 'Owner') store.setScreen('observability');
          else if (user.role === 'Auditor') store.setScreen('auditLog');
          else if (user.role === 'Analyst') store.setScreen('extraction');
          else if (user.role === 'Credit Officer') store.setScreen('signOff');
          else store.setScreen('applications');
        }}
      />
    );
  }

  const activeApp = state.applications.find(a => a.id === state.activeCaseId) || state.applications[0];
  const activeDocs = state.documents[state.activeCaseId] || [];
  const activeFigures = state.extractions[state.activeCaseId] || [];

  return (
    <AppShell
      currentRole={state.currentRole}
      currentUser={authSession.currentUser}
      onLogout={handleLogout}
      onRoleChange={role => {
        store.setRole(role);
        const newUser = AuthService.getUserByRole(role);
        setAuthSession({ isAuthenticated: true, currentUser: newUser });
        AuthService.saveSession(newUser);
        if (role === 'Owner') {
          store.setScreen('observability');
          showToast('info', 'Platform Owner Mode Active', 'Switched to LLM Observability & Model Cost Accounting.');
        } else if (role === 'Auditor') {
          store.setScreen('auditLog');
          showToast('info', 'Auditor Mode Active', 'Operating as Regulatory Auditor (Read-Only)');
        } else {
          showToast('info', 'Active Persona Switched', `Now operating as ${role} (${newUser.name})`);
        }
      }}
      currentScreen={state.currentScreen}
      onScreenChange={screen => store.setScreen(screen)}
      applications={state.applications}
      activeCaseId={state.activeCaseId}
      onCaseChange={caseId => {
        store.setActiveCase(caseId);
        showToast('info', 'Active Case Switched', `Loaded file: ${caseId}`);
      }}
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
            showToast('info', 'Case Selected', `Switched to Day-1 Checklist for ${caseId}`);
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
              showToast('success', 'Document Received & Verified', `${missing.title} uploaded successfully.`);
            } else {
              showToast('info', 'Intake Complete', 'All required documents have already been uploaded.');
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
            showToast('success', 'Deficiency Notice Dispatched', `Round ${activeApp.requestSentCount} request logged to audit trail.`);
          }}
        />
      )}

      {state.currentScreen === 'gapCheck' && (
        <GapCheckResults
          application={activeApp}
          documents={activeDocs}
        />
      )}

      {(state.currentScreen === 'extraction' || state.currentScreen === 'analyst') && (
        <ExtractionReview
          application={activeApp}
          figures={activeFigures}
          currentRole={state.currentRole}
          onConfirmFigure={figId => {
            store.confirmFigure(figId, ROLES[state.currentRole].name);
            showToast('success', 'Figure Confirmed', 'Verified against document bounding box.');
          }}
          onOverrideFigure={(figId, val, reason) => {
            store.overrideFigure(figId, val, reason, ROLES[state.currentRole].name);
            showToast('warning', 'Figure Overridden', `Adjusted to ₹${val.toLocaleString('en-IN')}. Rationale logged.`);
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
            showToast(decision === 'Approved' ? 'success' : decision === 'Rejected' ? 'error' : 'warning', `Credit Decision: ${decision}`, `Signed off by ${ROLES[state.currentRole].name}`);
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
            showToast('info', 'Demo Data Reset', 'Restored initial mock seed data.');
          }}
        />
      )}

      {state.currentScreen === 'observability' && (
        <LLMObservability />
      )}
    </AppShell>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};
