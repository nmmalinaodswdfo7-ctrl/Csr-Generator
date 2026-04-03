(function () {
  const LOGIN_SHEET = "MLS";
  const ENABLE_SERVER_AUTH_LOGIN = true;
  const ENABLE_SERVER_SHEET_PROXY = true;
  const ONE_TIME_LOGIN_KEY = "csr_one_time_login_v1";
  const UI_SESSION_KEY = "csr_ui_session_v1";
  const CSR_VIEW_STATE_KEY = "csr_view_state_v1";
  const DOWNLOADS_HANDLE_DB = "csr_downloads_handle_db";
  const DOWNLOADS_HANDLE_STORE = "handles";
  const DOWNLOADS_HANDLE_KEY = "downloads_dir";
  const RECOMMENDATION_DEFAULT_NAMES_KEY = "csr_recommendation_default_names_v1";
  const SCSR_RECOMMENDATION_DEFAULT_NAMES_KEY = "scsr_recommendation_default_names_v1";
  const CSR_TEMPLATE_PAYLOAD_KEY = "csr_template_payload_v1";
  const SCSR_TEMPLATE_PAYLOAD_KEY = "scsr_template_payload_v1";
  const CARDS_PER_PAGE = 20;
  const CARD_CACHE_KEY_PREFIX = "csr_cards_cache_v1_";
  const CARDS_PAGE_KEY_PREFIX = "csr_cards_page_v1_";
  const UPDATE_PENDING_KEY_PREFIX = "csr_update_pending_v1_";
  const ORPHAN_CLEANUP_PENDING_KEY_PREFIX = "csr_orphan_cleanup_pending_v1_";
  const MUNICIPALITY_CHANGE_CHECK_MS = 5 * 60 * 1000;
  const PROJECT_DOWNLOADS_DIR_LABEL = "app downloads folder";
  const TOAST_SUCCESS_DURATION_MS = 4000;
  const TOAST_ERROR_DURATION_MS = 3500;
  const EXPORT_SUCCESS_REDIRECT_DELAY_MS = 500;
  // Set to a number (e.g. 3000) to force one global toast duration for all toasts.
  // Keep as null to use per-type defaults and per-call overrides.
  const TOAST_GLOBAL_DURATION_MS = null;
  const CSR_DB_NAME = "csr_generator_db_v1";
  const CSR_STORE_NAME = "csrs";
  const CSR_ID_MIN = 10000;
  const CSR_ID_MAX = 99999;
  const CSR_STEP_COUNT = 6;
  const SCSR_STEP_COUNT = 8;
  const CSR_STEP_TITLES = Object.freeze([
    "Basic Information",
    "Family Composition",
    "Case Development",
    "Interventions Provided",
    "Household Intervention Plan",
    "Recommendation",
  ]);
  const SCSR_STEP_TITLES = Object.freeze([
    "Identifying Information",
    "Family Composition",
    "Presenting Problem",
    "Background Information",
    "Case Assessment",
    "Intervention Plan/Plan Implementation",
    "Case Management Evaluation",
    "Case Recommendation",
  ]);
  const SCSR_BACKGROUND_TABS = Object.freeze([
    { key: "socioEconomic", label: "Socio-Economic" },
    { key: "healthCondition", label: "Health Condition" },
    { key: "environmentalLivingConditions", label: "Environmental and Living Conditions" },
    { key: "environmentCommunity", label: "The Environment/ Community" },
  ]);
  const LOCAL_MATERIAL_SYMBOL_SVGS = Object.freeze({
    add:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    arrow_back:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H6"/><path d="m12 6-6 6 6 6"/></svg>',
    chevron_left:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>',
    chevron_right:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>',
    delete:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 12h8l1-12"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>',
    edit:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.5-1 8.7-8.7-3.5-3.5L5 15.5 4 20z"/><path d="m12.9 6.9 3.5 3.5"/><path d="M14 5.8 16.2 3.6a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L17.2 9"/></svg>',
    file_download:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10"/><path d="m8 10 4 4 4-4"/><path d="M5 19h14"/></svg>',
    info:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10v6"/><path d="M12 7.5h.01"/></svg>',
    open_in_new:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5"/><path d="m10 14 9-9"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
    person_add:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="8" r="3"/><path d="M4.5 18c1.4-2.8 3.5-4.2 5.5-4.2s4.1 1.4 5.5 4.2"/><path d="M18 8v6"/><path d="M15 11h6"/></svg>',
    person_outline:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.25"/><path d="M5 19c1.7-3.2 4.1-4.8 7-4.8s5.3 1.6 7 4.8"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 4 3 3-1.8 2.4a13 13 0 0 0 7.4 7.4L17 15l3 3-2.2 2.2a2 2 0 0 1-1.8.5C9.7 19.5 4.5 14.3 3.3 8a2 2 0 0 1 .5-1.8L6 4z"/></svg>',
    preview:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    restart_alt:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7H4V3"/><path d="M4 7c2-2.8 4.9-4 8-4 4.8 0 8.8 3.4 8.8 8 0 3.2-1.9 5.9-4.8 7.2"/><path d="M16 21h4v-4"/></svg>',
    restore:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v5h5"/><path d="M4.8 9A8 8 0 1 1 12 20"/><path d="M12 8v4l3 2"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></svg>',
    sync_alt:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h11"/><path d="m13 5 3 3-3 3"/><path d="M19 16H8"/><path d="m11 13-3 3 3 3"/></svg>',
  });
  const SOURCE_OF_INFO_FIELD_ID = "edit-source-of-info";
  const SOURCE_OF_INFO_DATALIST_ID = "source-of-info-datalist";
  const PREV_WELLBEING_FIELD_ID = "edit-prev-wellbeing";
  const PREV_WELLBEING_DATALIST_ID = "prev-wellbeing-datalist";
  const CSR_PREV_WELLBEING_OPTIONS = Object.freeze([
    "Level 2 - Subsistence Index Score : 2.56792",
    "Level 3 - Self-Sufficient Index Score : 2.923",
  ]);
  const SCSR_PREV_WELLBEING_OPTIONS = Object.freeze([
    "Level 1 - Survival",
    "Level 2 - Subsistence",
    "Level 3 - Self - Sufficient",
  ]);
  const BASIC_INFO_AUTOSAVE_DELAY_MS = 700;
  const FAMILY_COMPOSITION_AUTOSAVE_DELAY_MS = 700;
  const FAMILY_COMPOSITION_NEW_MEMBER_BADGE_DURATION_MS = 60 * 1000;
  const CASE_DEVELOPMENT_AUTOSAVE_DELAY_MS = 700;
  const INTERVENTIONS_PROVIDED_AUTOSAVE_DELAY_MS = 700;
  const INTERVENTIONS_PROVIDED_DRAFT_AUTOSAVE_DELAY_MS = 700;
  const HOUSEHOLD_INTERVENTION_PLAN_AUTOSAVE_DELAY_MS = 700;
  const HOUSEHOLD_INTERVENTION_PLAN_DRAFT_AUTOSAVE_DELAY_MS = 700;
  const RECOMMENDATION_AUTOSAVE_DELAY_MS = 700;
  const SCSR_BACKGROUND_AUTOSAVE_DELAY_MS = 700;
  const RECOMMENDATION_DEFAULT_NAMES = Object.freeze({
    reviewedBy: "MIGUELIZA V. FELIAS, RSW",
    notedBy: "LUZ C. FEGARIDO, RSW",
    approvedBy: "JIAH L. SAYSON",
    mswdOfficer: "ESTRELLA S. MALNEGRO, RSW",
  });
  const SCSR_RECOMMENDATION_APPROVED_BY = "SHALAINE MARIE S. LUCERO, CESO III";
  const CROSS_WORKFLOW_SHARED_BASIC_FIELDS = Object.freeze([
    "granteeName",
    "sex",
    "birthday",
    "age",
    "civilStatus",
    "educationalAttainment",
    "contactInfo",
    "religion",
    "placeOfBirth",
  ]);
  const CROSS_WORKFLOW_SHARED_FAMILY_COMPOSITION_FIELDS = Object.freeze([
    "monitoredChild",
    "educationalAttainment",
    "occupation",
    "monthlyIncome",
    "typeOfDisability",
  ]);
  const BASIC_INFO_OPTIONAL_FIELD_IDS = new Set([
    "edit-contact-info",
    "edit-national-id",
  ]);
  const CSR_BASIC_INFO_REQUIRED_FIELD_IDS = Object.freeze([
    "edit-educational-attainment",
    "edit-contact-info",
    "edit-national-id",
    "edit-religion",
    "edit-year-registration",
    "edit-years-program",
    "edit-present-address",
    "edit-place-of-birth",
    "edit-source-of-info",
    "edit-prev-wellbeing",
  ]);
  const SCSR_BASIC_INFO_REQUIRED_FIELD_IDS = Object.freeze([
    "edit-educational-attainment",
    "edit-contact-info",
    "edit-religion",
    "edit-present-address",
    "edit-place-of-birth",
    "edit-source-of-info",
    "edit-prev-wellbeing",
  ]);
  const CARD_STATUS_STYLE_BY_CODE = Object.freeze({
    1: { background: "#DCFCE7", text: "#166534" },
    3: { background: "#D1FAE5", text: "#047857" },
    6: { background: "#E2E8F0", text: "#334155" },
    7: { background: "#FECACA", text: "#991B1B" },
    8: { background: "#FFE4E6", text: "#BE123C" },
    10: { background: "#FFE2E5", text: "#C1121F" },
    12: { background: "#FFF0D9", text: "#D97706" },
    14: { background: "#E2E8F0", text: "#334155" },
    15: { background: "#F3E8FF", text: "#7E22CE" },
    17: { background: "#DBEAFE", text: "#1D4ED8" },
    19: { background: "#FEF9C3", text: "#A16207" },
    29: { background: "#E5E7EB", text: "#374151" },
    32: { background: "#FDEAD7", text: "#9A3412" },
    33: { background: "#E0E7FF", text: "#4338CA" },
    default: { background: "#DCFCE7", text: "#166534" },
  });
  const sheetCache = new Map();
  let downloadsDirectoryHandle = null;
  let csrDbPromise = null;
  let sessionEventSource = null;
  let serverLogoutToastShown = false;
  let pendingRestoreSession = null;
  let allCardRecords = [];
  let filteredCardRecords = [];
  let currentCardsPage = 1;
  let municipalityWatcherId = null;
  let municipalityCheckInFlight = false;
  let activeMunicipalityForCards = "";
  let currentMunicipalityFingerprint = "";
  let pendingMunicipalityRows = null;
  let lastSheetServerWriteError = "";
  let hasPendingMunicipalityUpdate = false;
  let currentCsrRecord = null;
  let activeCsrStep = 1;
  let basicInfoPrefillRequestSeq = 0;
  let basicInfoAutoSaveTimer = null;
  let familyCompositionAutoSaveTimer = null;
  let familyCompositionAccordionStateSaveTimer = null;
  let familyCompositionNewMemberBadgeTimer = null;
  let familyCompositionMemberModalMode = "add";
  let familyCompositionEditingMemberKey = "";
  let caseDevelopmentAutoSaveTimer = null;
  let scsrPresentingProblemAutoSaveTimer = null;
  let interventionsProvidedAutoSaveTimer = null;
  let interventionsProvidedDraftAutoSaveTimer = null;
  let scsrPlanImplementationAutoSaveTimer = null;
  let scsrPlanImplementationDraftAutoSaveTimer = null;
  let householdInterventionPlanAutoSaveTimer = null;
  let householdInterventionPlanDraftAutoSaveTimer = null;
  let recommendationAutoSaveTimer = null;
  let scsrRecommendationAutoSaveTimer = null;
  let recommendationPdfExportInProgress = false;
  let scsrRecommendationPdfExportInProgress = false;
  let exportInvalidSteps = new Set();
  let exportValidationArmed = false;
  let recommendationPreparedByFetchPromise = null;
  let scsrRecommendationPreparedByFetchPromise = null;
  let caseDevelopmentApplyingEditorValue = false;
  let caseDevelopmentSummernoteReady = false;
  let scsrBackgroundAutoSaveTimer = null;
  let scsrBackgroundApplyingEditorValue = false;
  let scsrBackgroundSummernoteReady = false;
  let activeScsrBackgroundTabKey = SCSR_BACKGROUND_TABS[0].key;
  let scsrBackgroundInvalidTabKeys = new Set();
  let scsrCaseAssessmentAutoSaveTimer = null;
  let scsrCaseAssessmentApplyingEditorValue = false;
  let scsrCaseAssessmentSummernoteReady = false;
  let scsrCaseManagementEvaluationAutoSaveTimer = null;
  let scsrCaseManagementEvaluationApplyingEditorValue = false;
  let scsrCaseManagementEvaluationSummernoteReady = false;
  let loginInProgress = false;
  let csrOpenConfirmShownKeys = new Set();
  let pendingCsrDeepLink = null;
  let educationalAttainmentSyncInProgress = false;
  let stepTriggers = [];
  let activeWorkflowType = "CSR";
  let pendingWorkflowCardData = null;
  const workflowIsolationCleanupDone = new Set();
  let crossWorkflowSyncQueue = Promise.resolve();
  let browserAppVersion = "";
  let releaseUpdaterDismissedVersion = "";
  let releaseUpdaterUnsubscribe = null;
  let releaseUpdaterState = {
    status: "disabled",
    currentVersion: "",
    latestVersion: "",
    releaseNotes: [],
    message: "",
    progressPercent: 0,
    canUpdate: false,
  };

  const idInput = document.getElementById("user-id");
  const municipalitySelect = document.getElementById("municipality");
  const loginIdField = document.getElementById("login-id-field");
  const loginMunicipalityField = document.getElementById("login-municipality-field");
  const loginButton = document.getElementById("search-id");
  const loginButtonLabel = loginButton
    ? loginButton.querySelector("span")
    : null;
  const restoreSessionButton = document.getElementById("restore-session");
  const appBootScreen = document.getElementById("app-boot-screen");
  const loginSection = document.getElementById("login-section");
  const appMain = document.getElementById("app-main");
  const dataTableHeader = document.getElementById("data-table-header");
  const appVersionBadge = document.getElementById("app-version-badge");
  const returnToSelectionButton = document.getElementById("return-to-csr-selection");
  const dataTableCard = document.getElementById("data-table-card");
  const dataSearchInput = document.getElementById("data-search-input");
  const barangayFilter = document.getElementById("barangay-filter");
  const statusFilter = document.getElementById("status-filter");
  const updateDataButton = document.getElementById("update-data-btn");
  const dataLoader = document.getElementById("data-loader");
  const householdGrid = document.getElementById("household-grid");
  const csrStepper = document.getElementById("csr-stepper");
  const csrStepperMobile = document.getElementById("csr-stepper-mobile");
  const csrStepperDesktop = document.getElementById("csr-stepper-desktop");
  const csrStepperDesktopWrap = document.getElementById("csr-stepper-desktop-wrap");
  const stepSections = Array.from(document.querySelectorAll("[data-step-section]"));
  const summaryStart = document.getElementById("summary-start");
  const summaryEnd = document.getElementById("summary-end");
  const summaryTotal = document.getElementById("summary-total");
  const pagePrevButton = document.getElementById("page-prev");
  const pageNextButton = document.getElementById("page-next");
  const pageNumbersContainer = document.getElementById("page-numbers");
  const idError = document.getElementById("user-id-error");
  const municipalityError = document.getElementById("municipality-error");
  const basicInfoSaveStatus = document.getElementById("basic-info-save-status");
  const familyCompositionList = document.getElementById("family-composition-list");
  const familyCompositionEmpty = document.getElementById("family-composition-empty");
  const familyCompositionBackButton = document.getElementById("family-composition-back-btn");
  const familyCompositionSaveStatus = document.getElementById("family-composition-save-status");
  const caseDevelopmentBackButton = document.getElementById("case-development-back-btn");
  const caseDevelopmentSaveStatus = document.getElementById("case-development-save-status");
  const scsrBackgroundTabList = document.getElementById("scsr-background-tabs");
  const scsrBackgroundBackButton = document.getElementById("scsr-background-back-btn");
  const scsrBackgroundSaveStatus = document.getElementById("scsr-background-save-status");
  const scsrCaseAssessmentBackButton = document.getElementById("scsr-case-assessment-back-btn");
  const scsrCaseAssessmentSaveStatus = document.getElementById("scsr-case-assessment-save-status");
  const scsrCaseManagementEvaluationBackButton = document.getElementById("scsr-case-management-evaluation-back-btn");
  const scsrCaseManagementEvaluationSaveStatus = document.getElementById("scsr-case-management-evaluation-save-status");
  const interventionsProvidedBackButton = document.getElementById("interventions-provided-back-btn");
  const interventionsProvidedSaveStatus = document.getElementById("interventions-provided-save-status");
  const interventionsProvidedList = document.getElementById("interventions-provided-list");
  const interventionsProvidedAddButton = document.getElementById("interventions-provided-add-btn");
  const interventionsProvidedModal = document.getElementById("interventions-provided-modal");
  const interventionsProvidedModalTitle = document.getElementById("modal-title");
  const interventionsProvidedCloseButton = document.getElementById("interventions-provided-close-btn");
  const interventionsProvidedCancelButton = document.getElementById("interventions-provided-cancel-btn");
  const interventionsProvidedModalSaveButton = document.getElementById("interventions-provided-modal-save-btn");
  const interventionsProvidedTextField = document.getElementById("interventions");
  const interventionsProvidedDateField = document.getElementById("date_accomplished");
  const interventionsProvidedPartiesField = document.getElementById("involved_parties");
  const scsrPlanImplementationBackButton = document.getElementById("scsr-plan-implementation-back-btn");
  const scsrPlanImplementationSaveStatus = document.getElementById("scsr-plan-implementation-save-status");
  const scsrPlanImplementationList = document.getElementById("scsr-plan-implementation-list");
  const scsrPlanImplementationAddButton = document.getElementById("scsr-plan-implementation-add-btn");
  const scsrPlanImplementationModal = document.getElementById("scsr-plan-implementation-modal");
  const scsrPlanImplementationModalTitle = document.getElementById("scsr-plan-implementation-modal-title");
  const scsrPlanImplementationCloseButton = document.getElementById("scsr-plan-implementation-close-btn");
  const scsrPlanImplementationCancelButton = document.getElementById("scsr-plan-implementation-cancel-btn");
  const scsrPlanImplementationModalSaveButton = document.getElementById("scsr-plan-implementation-modal-save-btn");
  const scsrPlanObjectiveField = document.getElementById("scsr-plan-objective");
  const scsrPlanActivitiesField = document.getElementById("scsr-plan-activities");
  const scsrPlanTimeframeField = document.getElementById("scsr-plan-timeframe");
  const scsrPlanPersonResponsibleField = document.getElementById("scsr-plan-person-responsible");
  const scsrPlanMaterialsNeededField = document.getElementById("scsr-plan-materials-needed");
  const scsrPlanExpectedOutputField = document.getElementById("scsr-plan-expected-output");
  const householdInterventionPlanBackButton = document.getElementById("household-intervention-plan-back-btn");
  const householdInterventionPlanSaveStatus = document.getElementById("household-intervention-plan-save-status");
  const householdInterventionPlanList = document.getElementById("household-intervention-plan-list");
  const householdInterventionPlanAddButton = document.getElementById("household-intervention-plan-add-btn");
  const householdInterventionPlanModal = document.getElementById("household-intervention-plan-modal");
  const householdInterventionPlanModalTitle = document.getElementById("household-intervention-plan-modal-title");
  const householdInterventionPlanCloseButton = document.getElementById("household-intervention-plan-close-btn");
  const householdInterventionPlanCancelButton = document.getElementById("household-intervention-plan-cancel-btn");
  const householdInterventionPlanModalSaveButton = document.getElementById("household-intervention-plan-modal-save-btn");
  const householdInterventionPlanObjectivesField = document.getElementById("objectives");
  const householdInterventionPlanActivitiesField = document.getElementById("activities");
  const householdInterventionPlanResponsibleField = document.getElementById("responsible");
  const householdInterventionPlanTimelineField = document.getElementById("timeline");
  const householdInterventionPlanOutcomeField = document.getElementById("outcome");
  const recommendationBackButton = document.getElementById("recommendation-back-btn");
  const recommendationPrintPreviewButton = document.getElementById("recommendation-print-preview-btn");
  const recommendationExportButton = document.getElementById("recommendation-export-btn");
  const recommendationSaveStatus = document.getElementById("recommendation-save-status");
  const recommendationPreviewModal = document.getElementById("recommendation-preview-modal");
  const recommendationPreviewIframe = document.getElementById("recommendation-preview-iframe");
  const recommendationPreviewLoading = document.getElementById("recommendation-preview-loading");
  const recommendationPreviewOpenBrowserButton = document.getElementById(
    "recommendation-preview-open-browser-btn"
  );
  const workflowTypeModal = document.getElementById("workflow-type-modal");
  const workflowTypeModalCancelButton = document.getElementById("workflow-type-modal-cancel-btn");
  const workflowTypeCsrButton = document.getElementById("workflow-type-csr-btn");
  const workflowTypeScsrButton = document.getElementById("workflow-type-scsr-btn");
  const releaseUpdaterModal = document.getElementById("release-updater-modal");
  const releaseUpdaterTitle = document.getElementById("release-updater-title");
  const releaseUpdaterVersion = document.getElementById("release-updater-version");
  const releaseUpdaterBody = document.getElementById("release-updater-body");
  const releaseUpdaterNotes = document.getElementById("release-updater-notes");
  const releaseUpdaterCancelButton = document.getElementById("release-updater-cancel-btn");
  const releaseUpdaterActionButton = document.getElementById("release-updater-update-btn");
  const recommendationPreviewCloseButton = document.getElementById("recommendation-preview-close-btn");
  const recommendationTextField = document.getElementById("recommendation_text");
  const recommendationDateField = document.getElementById("recommendation_date");
  const recommendationPreparedByField = document.getElementById("recommendation-prepared-by");
  const recommendationReviewedByField = document.getElementById("recommendation-reviewed-by");
  const recommendationNotedByField = document.getElementById("recommendation-noted-by");
  const recommendationApprovedByField = document.getElementById("recommendation-approved-by");
  const recommendationHhGranteeField = document.getElementById("recommendation-hh-grantee");
  const recommendationMswdOfficerField = document.getElementById("recommendation-mswd-officer");
  const recommendationReviewedBySaveButton = document.getElementById("recommendation-reviewed-by-save-btn");
  const recommendationNotedBySaveButton = document.getElementById("recommendation-noted-by-save-btn");
  const recommendationApprovedBySaveButton = document.getElementById("recommendation-approved-by-save-btn");
  const recommendationMswdOfficerSaveButton = document.getElementById("recommendation-mswd-officer-save-btn");
  const scsrRecommendationBackButton = document.getElementById("scsr-recommendation-back-btn");
  const scsrRecommendationPrintPreviewButton = document.getElementById("scsr-recommendation-print-preview-btn");
  const scsrRecommendationExportButton = document.getElementById("scsr-recommendation-export-btn");
  const scsrRecommendationSaveStatus = document.getElementById("scsr-recommendation-save-status");
  const scsrRecommendationDateField = document.getElementById("scsr-recommendation-date");
  const scsrRecommendationTextField = document.getElementById("scsr-recommendation_text");
  const scsrRecommendationPreparedByField = document.getElementById("scsr-recommendation-prepared-by");
  const scsrRecommendationReviewedByField = document.getElementById("scsr-recommendation-reviewed-by");
  const scsrRecommendationApprovedByField = document.getElementById("scsr-recommendation-approved-by");
  const scsrRecommendationReviewedBySaveButton = document.getElementById("scsr-recommendation-reviewed-by-save-btn");
  const scsrRecommendationApprovedBySaveButton = document.getElementById("scsr-recommendation-approved-by-save-btn");
  const scsrRecommendationPreviewModal = document.getElementById("scsr-recommendation-preview-modal");
  const scsrRecommendationPreviewIframe = document.getElementById("scsr-recommendation-preview-iframe");
  const scsrRecommendationPreviewLoading = document.getElementById("scsr-recommendation-preview-loading");
  const scsrRecommendationPreviewOpenBrowserButton = document.getElementById(
    "scsr-recommendation-preview-open-browser-btn"
  );
  const scsrRecommendationPreviewCloseButton = document.getElementById("scsr-recommendation-preview-close-btn");
  const familyCompositionRestoreButton = document.getElementById("family-composition-restore-btn");
  const familyCompositionAddButton = document.getElementById("family-composition-add-btn");
  const familyCompositionResetButton = document.getElementById("family-composition-reset-btn");
  const basicInfoRestoreButton = document.getElementById("basic-info-restore-btn");
  const basicInfoSectionTitle = document.getElementById("basic-info-section-title");
  const basicGranteeNameLabel = document.getElementById("basic-grantee-name-label");
  const basicSourceOfInfoLabel = document.getElementById("basic-source-of-info-label");
  const basicPrevWellBeingLabel = document.getElementById("basic-prev-wellbeing-label");
  const nationalIdFieldWrap = document.getElementById("basic-field-national-id-wrap");
  const yearRegistrationFieldWrap = document.getElementById("basic-field-year-registration-wrap");
  const yearsProgramFieldWrap = document.getElementById("basic-field-years-program-wrap");
  const scsrIncomeFieldsWrap = document.getElementById("scsr-income-fields");
  const monthlyIncomeField = document.getElementById("edit-monthly-income");
  const perCapitaIncomeField = document.getElementById("edit-per-capita-income");
  const familyCompositionRestoreModal = document.getElementById("family-composition-restore-modal");
  const familyCompositionRestoreList = document.getElementById("family-composition-restore-list");
  const familyCompositionRestoreCloseButton = document.getElementById("family-composition-restore-close-btn");
  const familyCompositionRestoreCancelButton = document.getElementById("family-composition-restore-cancel-btn");
  const familyCompositionAddModal = document.getElementById("family-composition-add-modal");
  const familyCompositionAddModalTitle = document.getElementById("family-composition-add-modal-title");
  const familyCompositionAddCloseButton = document.getElementById("family-composition-add-close-btn");
  const familyCompositionAddCancelButton = document.getElementById("family-composition-add-cancel-btn");
  const familyCompositionAddSubmitButton = document.getElementById("family-composition-add-submit-btn");
  const familyCompositionAddMemberIdField = document.getElementById("family-composition-add-member-id");
  const familyCompositionAddFullNameField = document.getElementById("family-composition-add-full-name");
  const familyCompositionAddRelationshipField = document.getElementById("family-composition-add-relationship");
  const familyCompositionAddBirthdayField = document.getElementById("family-composition-add-birthday");
  const familyCompositionAddAgeField = document.getElementById("family-composition-add-age");
  const familyCompositionAddSexField = document.getElementById("family-composition-add-sex");
  const familyCompositionAddCivilStatusField = document.getElementById("family-composition-add-civil-status");
  const basicGranteeNameInput = document.getElementById("basic-grantee-name");
  const basicHhIdInput = document.getElementById("basic-hh-id");
  const basicHhSetInput = document.getElementById("basic-hh-set");
  const basicSexInput = document.getElementById("basic-sex");
  const basicBirthdayInput = document.getElementById("basic-birthday");
  const basicAgeInput = document.getElementById("basic-age");
  const basicCivilStatusInput = document.getElementById("basic-civil-status");
  const basicIpAffiliationInput = document.getElementById("basic-ip-affiliation");
  const basicClientStatusOnExitInput = document.getElementById("basic-client-status-on-exit");
  const basicInfoPrefillSpinner = document.getElementById("basic-info-prefill-spinner");
  let latestFamilyCompositionRows = [];
  let interventionsProvidedEditingIndex = null;
  let scsrPlanImplementationEditingIndex = null;
  let householdInterventionPlanEditingIndex = null;

  initLocalMaterialSymbols();
  initSummernoteIfPresent();

  if (!idInput || !municipalitySelect || !loginButton) {
    return;
  }

  function renderMaterialSymbolIcon(node) {
    if (!(node instanceof HTMLElement)) {
      return;
    }
    const iconName = String(node.dataset.icon || node.textContent || "").trim();
    const svg = LOCAL_MATERIAL_SYMBOL_SVGS[iconName];
    if (!svg) {
      return;
    }
    node.dataset.icon = iconName;
    node.setAttribute("aria-hidden", "true");
    node.replaceChildren();
    node.insertAdjacentHTML("afterbegin", svg);
  }

  function renderMaterialSymbolIcons(root = document) {
    if (!root) {
      return;
    }
    if (root instanceof HTMLElement && root.classList.contains("material-symbols-outlined")) {
      renderMaterialSymbolIcon(root);
      return;
    }
    if (typeof root.querySelectorAll !== "function") {
      return;
    }
    root.querySelectorAll(".material-symbols-outlined").forEach(renderMaterialSymbolIcon);
  }

  function initLocalMaterialSymbols() {
    renderMaterialSymbolIcons(document);
    if (!document.body || typeof MutationObserver !== "function") {
      return;
    }
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            renderMaterialSymbolIcons(node);
          }
        });
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  pendingCsrDeepLink = parseCsrDeepLinkFromUrl();
  initializeSessionState();
  void hydrateBrowserAppVersion();
  initReleaseUpdaterUi();
  startServerSessionWatcher();
  document.addEventListener("visibilitychange", handleDocumentVisibilityChange);

  idInput.addEventListener("input", () => {
    const numbersOnly = idInput.value.replace(/\D/g, "");
    if (idInput.value !== numbersOnly) {
      idInput.value = numbersOnly;
    }

    if (idInput.value.trim()) {
      clearFieldError(idInput, idError);
    }
  });

  idInput.addEventListener("blur", validateIdField);

  municipalitySelect.addEventListener("change", () => {
    if (municipalitySelect.value.trim()) {
      clearFieldError(municipalitySelect, municipalityError);
    }
  });

  loginButton.addEventListener("click", handleLogin);
  if (restoreSessionButton) {
    restoreSessionButton.addEventListener("click", handleRestoreSession);
  }
  if (updateDataButton) {
    updateDataButton.addEventListener("click", handleUpdateDataClick);
  }
  if (dataSearchInput) {
    dataSearchInput.addEventListener("input", () => {
      currentCardsPage = 1;
      applyCardFiltersAndRender();
    });
  }
  if (barangayFilter) {
    barangayFilter.addEventListener("change", () => {
      currentCardsPage = 1;
      applyCardFiltersAndRender();
    });
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      currentCardsPage = 1;
      applyCardFiltersAndRender();
    });
  }
  if (pagePrevButton) {
    pagePrevButton.addEventListener("click", () => {
      if (currentCardsPage > 1) {
        currentCardsPage -= 1;
        saveCurrentCardsPageState();
        renderCardPage();
      }
    });
  }
  if (pageNextButton) {
    pageNextButton.addEventListener("click", () => {
      const totalPages = Math.max(
        1,
        Math.ceil(filteredCardRecords.length / CARDS_PER_PAGE)
      );
      if (currentCardsPage < totalPages) {
        currentCardsPage += 1;
        saveCurrentCardsPageState();
        renderCardPage();
      }
    });
  }
  if (householdGrid) {
    householdGrid.addEventListener("click", handleHouseholdGridClick);
  }
  if (returnToSelectionButton) {
    returnToSelectionButton.addEventListener("click", handleReturnToSelectionClick);
  }
  if (familyCompositionBackButton) {
    familyCompositionBackButton.addEventListener("click", () => setActiveCsrStep(1));
  }
  if (caseDevelopmentBackButton) {
    caseDevelopmentBackButton.addEventListener("click", handleCaseDevelopmentBackClick);
  }
  if (scsrBackgroundBackButton) {
    scsrBackgroundBackButton.addEventListener("click", handleScsrBackgroundBackClick);
  }
  if (scsrCaseAssessmentBackButton) {
    scsrCaseAssessmentBackButton.addEventListener("click", handleScsrCaseAssessmentBackClick);
  }
  if (scsrCaseManagementEvaluationBackButton) {
    scsrCaseManagementEvaluationBackButton.addEventListener("click", handleScsrCaseManagementEvaluationBackClick);
  }
  if (interventionsProvidedBackButton) {
    interventionsProvidedBackButton.addEventListener("click", handleInterventionsProvidedBackClick);
  }
  if (scsrPlanImplementationBackButton) {
    scsrPlanImplementationBackButton.addEventListener("click", handleScsrPlanImplementationBackClick);
  }
  if (householdInterventionPlanBackButton) {
    householdInterventionPlanBackButton.addEventListener("click", handleHouseholdInterventionPlanBackClick);
  }
  if (recommendationBackButton) {
    recommendationBackButton.addEventListener("click", handleRecommendationBackClick);
  }
  if (scsrRecommendationBackButton) {
    scsrRecommendationBackButton.addEventListener("click", handleScsrRecommendationBackClick);
  }
  if (scsrRecommendationPrintPreviewButton) {
    scsrRecommendationPrintPreviewButton.addEventListener("click", () => {
      void handleScsrRecommendationPrintPreviewClick();
    });
  }
  if (scsrRecommendationExportButton) {
    scsrRecommendationExportButton.addEventListener("click", () => {
      void handleScsrRecommendationExportClick();
    });
  }
  if (recommendationPrintPreviewButton) {
    recommendationPrintPreviewButton.addEventListener("click", () => {
      void handleRecommendationPrintPreviewClick();
    });
  }
  if (recommendationExportButton) {
    recommendationExportButton.addEventListener("click", () => {
      void handleRecommendationExportClick();
    });
  }
  if (recommendationPreviewCloseButton) {
    recommendationPreviewCloseButton.addEventListener("click", closeRecommendationPreviewModal);
  }
  if (recommendationPreviewOpenBrowserButton) {
    recommendationPreviewOpenBrowserButton.addEventListener("click", openRecommendationPreviewInBrowser);
  }
  if (recommendationPreviewModal) {
    recommendationPreviewModal.addEventListener("click", (event) => {
      if (event.target === recommendationPreviewModal) {
        closeRecommendationPreviewModal();
      }
    });
  }
  if (scsrRecommendationPreviewCloseButton) {
    scsrRecommendationPreviewCloseButton.addEventListener("click", closeScsrRecommendationPreviewModal);
  }
  if (scsrRecommendationPreviewOpenBrowserButton) {
    scsrRecommendationPreviewOpenBrowserButton.addEventListener("click", openScsrRecommendationPreviewInBrowser);
  }
  if (scsrRecommendationPreviewModal) {
    scsrRecommendationPreviewModal.addEventListener("click", (event) => {
      if (event.target === scsrRecommendationPreviewModal) {
        closeScsrRecommendationPreviewModal();
      }
    });
  }
  if (workflowTypeCsrButton) {
    workflowTypeCsrButton.addEventListener("click", () => {
      void handleWorkflowTypeSelection("CSR");
    });
  }
  if (workflowTypeScsrButton) {
    workflowTypeScsrButton.addEventListener("click", () => {
      void handleWorkflowTypeSelection("SCSR");
    });
  }
  if (workflowTypeModalCancelButton) {
    workflowTypeModalCancelButton.addEventListener("click", closeWorkflowTypeModal);
  }
  if (workflowTypeModal) {
    workflowTypeModal.addEventListener("click", (event) => {
      if (event.target === workflowTypeModal) {
        closeWorkflowTypeModal();
      }
    });
  }
  document.addEventListener("keydown", (event) => {
    if (!event) {
      return;
    }

    const recommendationPreviewOpen =
      recommendationPreviewModal &&
      !recommendationPreviewModal.classList.contains("hidden");
    const scsrRecommendationPreviewOpen =
      scsrRecommendationPreviewModal &&
      !scsrRecommendationPreviewModal.classList.contains("hidden");
    const interventionsModalOpen =
      interventionsProvidedModal &&
      !interventionsProvidedModal.classList.contains("hidden");
    const scsrPlanImplementationModalOpen =
      scsrPlanImplementationModal &&
      !scsrPlanImplementationModal.classList.contains("hidden");
    const householdPlanModalOpen =
      householdInterventionPlanModal &&
      !householdInterventionPlanModal.classList.contains("hidden");
    const workflowTypeModalOpen =
      workflowTypeModal &&
      !workflowTypeModal.classList.contains("hidden");
    if (event.key === "Escape") {
      if (workflowTypeModalOpen) {
        event.preventDefault();
        closeWorkflowTypeModal();
        return;
      }
      if (recommendationPreviewOpen) {
        event.preventDefault();
        closeRecommendationPreviewModal();
        return;
      }
      if (scsrRecommendationPreviewOpen) {
        event.preventDefault();
        closeScsrRecommendationPreviewModal();
        return;
      }
      if (interventionsModalOpen) {
        event.preventDefault();
        closeInterventionsProvidedModal();
        return;
      }
      if (scsrPlanImplementationModalOpen) {
        event.preventDefault();
        closeScsrPlanImplementationModal();
        return;
      }
      if (householdPlanModalOpen) {
        event.preventDefault();
        closeHouseholdInterventionPlanModal();
      }
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      if (interventionsModalOpen) {
        event.preventDefault();
        void handleInterventionProvidedSaveClick();
        return;
      }
      if (scsrPlanImplementationModalOpen) {
        event.preventDefault();
        void handleScsrPlanImplementationSaveClick();
        return;
      }
      if (householdPlanModalOpen) {
        event.preventDefault();
        void handleHouseholdInterventionPlanModalSaveClick();
      }
    }
  });
  if (familyCompositionRestoreButton) {
    familyCompositionRestoreButton.addEventListener("click", openFamilyCompositionRestoreModal);
  }
  if (familyCompositionAddButton) {
    familyCompositionAddButton.addEventListener("click", openFamilyCompositionAddMemberModal);
  }
  if (familyCompositionResetButton) {
    familyCompositionResetButton.addEventListener("click", () => {
      void handleFamilyCompositionResetClick();
    });
  }
  if (basicInfoRestoreButton) {
    basicInfoRestoreButton.addEventListener("click", () => {
      void handleBasicInfoRestoreClick();
    });
  }
  if (familyCompositionRestoreCloseButton) {
    familyCompositionRestoreCloseButton.addEventListener("click", closeFamilyCompositionRestoreModal);
  }
  if (familyCompositionRestoreCancelButton) {
    familyCompositionRestoreCancelButton.addEventListener("click", closeFamilyCompositionRestoreModal);
  }
  if (familyCompositionRestoreModal) {
    familyCompositionRestoreModal.addEventListener("click", (event) => {
      if (event.target === familyCompositionRestoreModal) {
        closeFamilyCompositionRestoreModal();
      }
    });
  }
  if (familyCompositionAddCloseButton) {
    familyCompositionAddCloseButton.addEventListener("click", closeFamilyCompositionAddMemberModal);
  }
  if (familyCompositionAddCancelButton) {
    familyCompositionAddCancelButton.addEventListener("click", closeFamilyCompositionAddMemberModal);
  }
  if (familyCompositionAddModal) {
    familyCompositionAddModal.addEventListener("click", (event) => {
      if (event.target === familyCompositionAddModal) {
        closeFamilyCompositionAddMemberModal();
      }
    });
  }
  if (familyCompositionAddSubmitButton) {
    familyCompositionAddSubmitButton.addEventListener("click", () => {
      void handleFamilyCompositionAddMemberSubmit();
    });
  }
  if (familyCompositionAddFullNameField) {
    familyCompositionAddFullNameField.addEventListener("input", handleFamilyCompositionAddFullNameInput);
  }
  if (familyCompositionAddBirthdayField) {
    familyCompositionAddBirthdayField.addEventListener("input", handleFamilyCompositionAddBirthdayInput);
    familyCompositionAddBirthdayField.addEventListener("change", handleFamilyCompositionAddBirthdayInput);
  }
  [
    familyCompositionAddRelationshipField,
    familyCompositionAddSexField,
    familyCompositionAddCivilStatusField,
  ].forEach((field) => {
    if (!field) {
      return;
    }
    field.addEventListener("change", () => {
      clearModalFieldError(field);
    });
  });
  bindStepperEvents();
  bindBasicInfoEditValidationListeners();
  bindBasicInfoFieldConstraints();
  bindBasicInfoAutoSaveListeners();
  bindEducationalAttainmentLiveSync();
  bindFamilyCompositionEvents();
  bindScsrBackgroundEvents();
  bindScsrPlanImplementationEvents();
  bindInterventionsProvidedEvents();
  bindHouseholdInterventionPlanEvents();
  bindRecommendationEvents();
  bindScsrRecommendationEvents();
  bindPageLifecycleAutoSaveFlush();
  setWorkflowType("CSR");

  [idInput, municipalitySelect].forEach((element) => {
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleLogin();
      }
    });
  });

  async function handleLogin() {
    if (loginInProgress) {
      return;
    }

    const isIdValid = validateIdField();
    const isMunicipalityValid = validateMunicipalityField();

    if (!isIdValid || !isMunicipalityValid) {
      showToast("Please fill in all fields.");
      return;
    }

    const userId = idInput.value.trim();
    const selectedMunicipality = normalizeMunicipalitySheetName(
      municipalitySelect.value
    );

    loginInProgress = true;
    setLoginButtonLoading(true);

    try {
      if (
        !isHttpContext() &&
        !downloadsDirectoryHandle &&
        typeof window.showDirectoryPicker === "function"
      ) {
        await selectDownloadsDirectory();
      }

      const existingOneTimeState = getOneTimeLoginState();
      if (existingOneTimeState && (downloadsDirectoryHandle || isHttpContext())) {
        const existingFiles = await verifyRequiredFilesInDownloads(
          existingOneTimeState.files || []
        );

        if (existingFiles.allPresent) {
          showToast(
            "One-time login already completed. Required files are still present.",
            "success",
            3000
          );
          showPostLoginUI();
          return;
        }

        clearOneTimeLoginState();
        showToast(
          "Required login files were not found. Please login again to regenerate them."
        );
      }

      let userRecord = null;
      let userMunicipality = "";
      let usedServerAuth = false;
      if (ENABLE_SERVER_AUTH_LOGIN && isHttpContext()) {
        const serverAuthResult = await authenticateLoginViaServer(
          userId,
          selectedMunicipality
        );
        if (serverAuthResult && serverAuthResult.ok) {
          usedServerAuth = true;
          userMunicipality = normalizeMunicipalitySheetName(
            String(serverAuthResult.user && serverAuthResult.user.municipality)
          );
          userRecord = {
            ID: userId,
            MUNICIPALITY: userMunicipality,
            NAMES: normalizeText(
              serverAuthResult.user && serverAuthResult.user.name
            ),
          };
        } else if (serverAuthResult && serverAuthResult.handled) {
          return;
        }
      }

      if (!userRecord) {
        const mlsData = await fetchSheetData(LOGIN_SHEET);
        userRecord = findUserById(mlsData, userId);

        if (!userRecord) {
          setFieldError(idInput, idError, "ID not found in MLS records.");
          showToast("ID not found.");
          return;
        }

        userMunicipality = normalizeMunicipalitySheetName(
          String(userRecord.MUNICIPALITY || "")
        );

        if (!userMunicipality) {
          setFieldError(
            municipalitySelect,
            municipalityError,
            "No municipality is assigned to this ID in MLS."
          );
          showToast("This ID has no municipality assignment in MLS.");
          return;
        }

        if (userMunicipality !== selectedMunicipality) {
          setFieldError(
            municipalitySelect,
            municipalityError,
            "Selected municipality does not match your ID."
          );
          showToast("Selected municipality does not match this ID.");
          return;
        }
      }

      clearFieldError(idInput, idError);
      clearFieldError(municipalitySelect, municipalityError);

      let municipalityData;
      let municipalityUpstreamError = null;
      try {
        // Prefer upstream on login so newly downloaded municipality JSON is fresh.
        municipalityData = await fetchSheetData(userMunicipality, true);
      } catch (error) {
        municipalityUpstreamError = error || null;
        // Fall back to local cache when upstream is temporarily unavailable.
        municipalityData = await fetchSheetData(userMunicipality, false);
      }
      if (!Array.isArray(municipalityData) || municipalityData.length === 0) {
        // Upstream may respond with an empty array even when service is reachable.
        // Retry local cache before cancelling login.
        try {
          municipalityData = await fetchSheetData(userMunicipality, false);
        } catch (_) {
          municipalityData = [];
        }
      }
      if (!Array.isArray(municipalityData) || municipalityData.length === 0) {
        clearLocalSessionState();
        await clearServerSession();
        showLoginUI();
        const upstreamReason = municipalityUpstreamError
          ? normalizeText(municipalityUpstreamError.message)
          : "";
        showDatasetOfflinePopup({
          title: "Municipality Dataset Unavailable",
          message: upstreamReason
            ? `Municipality data could not be loaded from source, and no local cache is available. ${upstreamReason}`
            : "Municipality source returned empty data. Contact the developer to check your municipality dataset.",
        });
        return;
      }
      const filteredMlsData = [
        {
          ID: userId,
          MUNICIPALITY: userMunicipality,
          NAMES: String(
            userRecord.NAMES ||
              userRecord.NAME ||
              userRecord.FULL_NAME ||
              ""
          ).trim(),
        },
      ];
      const filesToSave = [
        { sheetName: LOGIN_SHEET, data: filteredMlsData },
        { sheetName: userMunicipality, data: municipalityData },
      ];
      const expectedFiles = filesToSave.map(
        (item) => `${toSheetJsonBaseName(item.sheetName)}.json`
      );

      const fileResults = [];
      for (const item of filesToSave) {
        const result = await saveOrDownloadSheetJson(item.sheetName, item.data);
        fileResults.push(result);
      }

      let csrDbInitialized = await ensureMunicipalityDbFile(userMunicipality);
      if (usedServerAuth) {
        csrDbInitialized = true;
      }

      const savedCount = fileResults.filter((item) => item.savedToProject).length;
      const downloadedCount = fileResults.length - savedCount;
      setOneTimeLoginState({
        id: userId,
        municipality: userMunicipality,
        files: expectedFiles,
        loggedInAt: new Date().toISOString(),
      });

      if (downloadedCount === 0) {
        showToast(
          `${fileResults.map((item) => item.fileName).join(", ")} saved to ${PROJECT_DOWNLOADS_DIR_LABEL}.`,
          "success",
          4000
        );
        setUiSession({ loggedIn: true, id: userId, municipality: userMunicipality });
        await setServerSession({
          loggedIn: true,
          id: userId,
          municipality: userMunicipality,
          files: expectedFiles,
          csrDbInitialized,
          loggedInAt: new Date().toISOString(),
        });
        showPostLoginUI();
      } else {
        showToast(
          `${fileResults.map((item) => item.fileName).join(", ")} downloaded by browser. Move files to ${PROJECT_DOWNLOADS_DIR_LABEL} if needed.`,
          "success",
          4000
        );
        setUiSession({ loggedIn: true, id: userId, municipality: userMunicipality });
        await setServerSession({
          loggedIn: true,
          id: userId,
          municipality: userMunicipality,
          files: expectedFiles,
          csrDbInitialized,
          loggedInAt: new Date().toISOString(),
        });
        showPostLoginUI();
      }
    } catch (error) {
      console.error("Login validation failed:", error);
      const datasetOffline = isMunicipalityDatasetFetchFailure(error);
      maybeShowDatasetOfflinePopup(error);
      if (!datasetOffline) {
        const message =
          error && error.message
            ? `Unable to validate: ${error.message}`
            : "Unable to validate now. Please try again.";
        showToast(message);
      }
    } finally {
      loginInProgress = false;
      setLoginButtonLoading(false);
    }
  }

  async function authenticateLoginViaServer(id, municipality) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, municipality }),
      });
      if (response.status === 404) {
        return { ok: false, handled: false };
      }
      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {
        payload = null;
      }
      if (!response.ok || !payload || !payload.ok) {
        const errorMessage = normalizeText(payload && payload.error);
        if (response.status === 404) {
          setFieldError(idInput, idError, "ID not found in MLS records.");
          showToast(errorMessage || "ID not found.");
          return { ok: false, handled: true };
        }
        if (response.status === 403) {
          setFieldError(
            municipalitySelect,
            municipalityError,
            "Selected municipality does not match your ID."
          );
          showToast(
            errorMessage || "Selected municipality does not match this ID."
          );
          return { ok: false, handled: true };
        }
        return { ok: false, handled: false };
      }
      return {
        ok: true,
        handled: true,
        user: payload.user || null,
        session: payload.session || null,
      };
    } catch (_) {
      return { ok: false, handled: false };
    }
  }

  function setLoginButtonLoading(isLoading) {
    if (!loginButton) {
      return;
    }
    loginButton.disabled = isLoading;
    loginButton.classList.toggle("opacity-60", isLoading);
    loginButton.classList.toggle("cursor-not-allowed", isLoading);
    if (loginButtonLabel) {
      loginButtonLabel.textContent = isLoading ? "Downloading" : "Login";
    }
  }

  function validateIdField() {
    const value = idInput.value.trim();

    if (!value) {
      setFieldError(idInput, idError, "ID is required.");
      return false;
    }

    if (!/^\d+$/.test(value)) {
      setFieldError(idInput, idError, "ID must contain numbers only.");
      return false;
    }

    clearFieldError(idInput, idError);
    return true;
  }

  function validateMunicipalityField() {
    const value = municipalitySelect.value.trim();

    if (!value) {
      setFieldError(
        municipalitySelect,
        municipalityError,
        "Please select a municipality."
      );
      return false;
    }

    clearFieldError(municipalitySelect, municipalityError);
    return true;
  }

  async function fetchSheetData(sheetName, forceRefresh) {
    if (!forceRefresh && sheetCache.has(sheetName)) {
      return sheetCache.get(sheetName);
    }

    const safeSheetName = String(sheetName || "").trim();
    if (!safeSheetName) {
      throw new Error("Missing sheet name.");
    }

    if (safeSheetName === LOGIN_SHEET) {
      const data = await fetchMunicipalitySheetDataFromApi(
        safeSheetName,
        Boolean(forceRefresh)
      );
      sheetCache.set(safeSheetName, data);
      return data;
    }

    const resolvedSheetName = normalizeMunicipalitySheetName(safeSheetName);
    const data = await fetchMunicipalitySheetDataFromApi(
      resolvedSheetName,
      Boolean(forceRefresh)
    );
    sheetCache.set(safeSheetName, data);
    return data;
  }

  function normalizeMunicipalitySheetName(sheetName) {
    const safeSheetName = String(sheetName || "").trim().toUpperCase();
    if (safeSheetName === "PRES.CARLOS P. GARCIA") {
      return "PRESIDENT CARLOS P. GARCIA";
    }
    return safeSheetName;
  }

  function extractSheetArrayFromProxyPayload(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (!payload || typeof payload !== "object") {
      return null;
    }
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
    if (Array.isArray(payload.rows)) {
      return payload.rows;
    }
    if (payload.payload && typeof payload.payload === "object") {
      if (Array.isArray(payload.payload.data)) {
        return payload.payload.data;
      }
      if (Array.isArray(payload.payload.rows)) {
        return payload.payload.rows;
      }
    }
    if (payload.data && typeof payload.data === "object") {
      if (Array.isArray(payload.data.rows)) {
        return payload.data.rows;
      }
      if (Array.isArray(payload.data.data)) {
        return payload.data.data;
      }
    }
    if (payload.result && typeof payload.result === "object") {
      if (Array.isArray(payload.result.rows)) {
        return payload.result.rows;
      }
      if (Array.isArray(payload.result.data)) {
        return payload.result.data;
      }
    }
    const topKeys = Object.keys(payload);
    for (let i = 0; i < topKeys.length; i += 1) {
      const value = payload[topKeys[i]];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (Array.isArray(value.rows)) {
          return value.rows;
        }
        if (Array.isArray(value.data)) {
          return value.data;
        }
      }
    }
    return null;
  }

  function describeProxyPayloadShape(payload) {
    if (Array.isArray(payload)) {
      return `array(len=${payload.length})`;
    }
    if (!payload || typeof payload !== "object") {
      return typeof payload;
    }
    const topKeys = Object.keys(payload).slice(0, 8).join(",");
    const dataType = payload.data === undefined ? "none" : Array.isArray(payload.data) ? "array" : typeof payload.data;
    const rowsType = payload.rows === undefined ? "none" : Array.isArray(payload.rows) ? "array" : typeof payload.rows;
    return `object(keys=${topKeys || "none"};data=${dataType};rows=${rowsType})`;
  }

  async function fetchMunicipalitySheetDataFromApi(sheetName, preferUpstream) {
    if (isHttpContext() || ENABLE_SERVER_SHEET_PROXY) {
      const proxyUrl = `/api/sheet?sheet=${encodeURIComponent(sheetName)}${
        preferUpstream ? "&preferUpstream=1" : ""
      }`;
      let proxyResponse;
      try {
        proxyResponse = await fetch(proxyUrl, { cache: "no-store" });
      } catch (_) {
        throw buildMunicipalityDatasetFetchError(
          sheetName,
          `Failed to fetch sheet ${sheetName}. URL: ${proxyUrl}`
        );
      }
      if (!proxyResponse.ok) {
        let proxyMessage = "";
        try {
          const payload = await proxyResponse.json();
          proxyMessage = payload && payload.error ? ` ${payload.error}` : "";
        } catch (_) {
          // Ignore non-JSON error payloads.
        }
        throw buildMunicipalityDatasetFetchError(
          sheetName,
          `Failed to fetch sheet ${sheetName}: ${proxyResponse.status}. URL: ${proxyUrl}.${proxyMessage}`
        );
      }
      const proxyPayload = await proxyResponse.json();
      if (
        proxyPayload &&
        typeof proxyPayload === "object" &&
        proxyPayload.ok === false
      ) {
        const proxyErrorText =
          typeof proxyPayload.error === "string"
            ? proxyPayload.error
            : "Upstream dataset error.";
        throw buildMunicipalityDatasetFetchError(
          sheetName,
          `Failed to fetch sheet ${sheetName}. ${proxyErrorText}`
        );
      }
      const proxyData = extractSheetArrayFromProxyPayload(proxyPayload);
      if (!Array.isArray(proxyData)) {
        throw buildMunicipalityDatasetFetchError(
          sheetName,
          `Invalid response for sheet ${sheetName}. Shape: ${describeProxyPayloadShape(proxyPayload)}`
        );
      }
      return proxyData;
    }
    throw buildMunicipalityDatasetFetchError(
      sheetName,
      `Failed to fetch sheet ${sheetName}: secure proxy is required.`
    );
  }

  async function fetchMunicipalitySheetCompareFromApi(sheetName) {
    const safeSheetName = String(sheetName || "").trim();
    if (!safeSheetName) {
      throw buildMunicipalityDatasetFetchError(sheetName, "Missing sheet name.");
    }
    const compareUrl = `/api/sheet/compare?sheet=${encodeURIComponent(safeSheetName)}`;
    let response;
    try {
      response = await fetch(compareUrl, { cache: "no-store" });
    } catch (_) {
      throw buildMunicipalityDatasetFetchError(
        sheetName,
        `Failed to compare sheet ${sheetName}. URL: ${compareUrl}`
      );
    }
    if (!response.ok) {
      let compareMessage = "";
      try {
        const payload = await response.json();
        compareMessage = payload && payload.error ? ` ${payload.error}` : "";
      } catch (_) {
        compareMessage = "";
      }
      throw buildMunicipalityDatasetFetchError(
        sheetName,
        `Failed to compare sheet ${sheetName}: ${response.status}. URL: ${compareUrl}.${compareMessage}`
      );
    }
    const payload = await response.json();
    if (!payload || payload.ok !== true) {
      throw buildMunicipalityDatasetFetchError(
        sheetName,
        `Invalid compare response for sheet ${sheetName}`
      );
    }
    return payload;
  }

  function buildMunicipalityDatasetFetchError(sheetName, message) {
    const error = new Error(message);
    error.code = "MUNICIPALITY_DATASET_FETCH_FAILED";
    error.sheetName = sheetName;
    return error;
  }

  function findUserById(records, id) {
    return records.find((record) => String(record.ID || "").trim() === id);
  }

  function getOneTimeLoginState() {
    try {
      const raw = window.localStorage.getItem(ONE_TIME_LOGIN_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.files)) {
        return null;
      }

      return parsed;
    } catch (_) {
      return null;
    }
  }

  function getUiSession() {
    try {
      const raw = window.localStorage.getItem(UI_SESSION_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function setUiSession(session) {
    try {
      window.localStorage.setItem(UI_SESSION_KEY, JSON.stringify(session));
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function clearUiSession() {
    try {
      window.localStorage.removeItem(UI_SESSION_KEY);
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function setOneTimeLoginState(state) {
    try {
      window.localStorage.setItem(ONE_TIME_LOGIN_KEY, JSON.stringify(state));
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function clearOneTimeLoginState() {
    try {
      clearLocalSessionState();
      void clearServerSession();
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function clearLocalSessionState() {
    try {
      window.localStorage.removeItem(ONE_TIME_LOGIN_KEY);
      window.localStorage.removeItem(CSR_VIEW_STATE_KEY);
      clearUiSession();
      clearCardsCache();
      resetMunicipalityUpdateState();
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function parseCsrDeepLinkFromUrl() {
    try {
      const search = window.location && typeof window.location.search === "string"
        ? window.location.search
        : "";
      if (!search) {
        return null;
      }
      const query = new URLSearchParams(search);
      const csrIdRaw = normalizeText(query.get("csrId") || query.get("id"));
      if (!/^\d{4,6}$/.test(csrIdRaw)) {
        return null;
      }
      const municipalityRaw = normalizeText(
        query.get("municipality") || query.get("mun")
      ).toUpperCase();
      return {
        csrId: csrIdRaw,
        municipality: municipalityRaw || "",
      };
    } catch (_) {
      return null;
    }
  }

  function consumePendingCsrDeepLink() {
    const deepLink = pendingCsrDeepLink;
    pendingCsrDeepLink = null;
    return deepLink;
  }

  async function initializeSessionState() {
    setAppBootScreenVisible(true);
    loginButton.disabled = true;

    try {
      if (isHttpContext()) {
        const serverSession = await getServerSession();
        if (!serverSession || !serverSession.loggedIn) {
          clearLocalSessionState();
          await showRestoreOrLoginUI();
          return;
        }

        const municipality = String(serverSession.municipality || "")
          .trim()
          .toUpperCase();

        setUiSession({
          loggedIn: true,
          id: String(serverSession.id || "").trim(),
          municipality: municipality,
        });
        if (Array.isArray(serverSession.files) && serverSession.files.length) {
          setOneTimeLoginState({
            id: String(serverSession.id || "").trim(),
            municipality: municipality,
            files: serverSession.files,
            loggedInAt: String(
              serverSession.loggedInAt || new Date().toISOString()
            ),
          });
          const expectedFiles = getExpectedRequiredDownloadFiles(serverSession);
          const existingFiles = await verifyRequiredFilesInDownloads(expectedFiles);
          if (!downloadsDirectoryHandle) {
            downloadsDirectoryHandle = await getStoredDownloadsDirectoryHandle();
          }
          const hasMunicipalityFile = downloadsDirectoryHandle
            ? await hasRequiredMunicipalityFileInDownloads(serverSession)
            : true;
          if (!existingFiles.allPresent || !hasMunicipalityFile) {
            clearLocalSessionState();
            await clearServerSession();
            showLoginUI();
            showToast("Required files were deleted. Please login again.");
            return;
          }
        }
        showPostLoginUI();
        return;
      }

      const uiSession = getUiSession();
      const oneTimeState = getOneTimeLoginState();

      if (!uiSession || !uiSession.loggedIn) {
        return;
      }

      if (!oneTimeState || !Array.isArray(oneTimeState.files)) {
        showPostLoginUI();
        return;
      }

      downloadsDirectoryHandle = await getStoredDownloadsDirectoryHandle();
      if (!downloadsDirectoryHandle) {
        // Keep session alive even if folder permission is not currently available.
        showPostLoginUI();
        return;
      }

      const expectedFiles = getExpectedRequiredDownloadFiles(oneTimeState);
      const existingFiles = await verifyRequiredFilesInDownloads(expectedFiles);
      const hasMunicipalityFile = await hasRequiredMunicipalityFileInDownloads(
        oneTimeState
      );

      if (!existingFiles.allPresent || !hasMunicipalityFile) {
        clearOneTimeLoginState();
        showToast("Required files were deleted. Please login again.");
        return;
      }

      showPostLoginUI();
    } catch (_) {
      if (isHttpContext()) {
        clearLocalSessionState();
        await showRestoreOrLoginUI();
        return;
      }
      showPostLoginUI();
    } finally {
      loginButton.disabled = false;
    }
  }

  async function getServerSession() {
    if (!isHttpContext()) {
      return null;
    }

    try {
      const response = await fetch("/api/session", { cache: "no-store" });
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      if (!payload || !payload.ok) {
        return null;
      }
      return payload.session || null;
    } catch (_) {
      return null;
    }
  }

  async function getMunicipalityStorageStatus(municipality) {
    if (!isHttpContext()) {
      return null;
    }

    const safeMunicipality = normalizeText(municipality).toUpperCase();
    if (!safeMunicipality) {
      return null;
    }

    try {
      const query = new URLSearchParams({ municipality: safeMunicipality });
      const response = await fetch(`/api/csr/status?${query.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      if (!payload || !payload.ok) {
        return null;
      }
      return payload;
    } catch (_) {
      return null;
    }
  }

  async function hasMunicipalityDbFile(municipality) {
    const safeMunicipality = normalizeText(municipality).toUpperCase();
    if (!safeMunicipality) {
      return true;
    }

    const status = await getMunicipalityStorageStatus(safeMunicipality);
    if (!status) {
      // Do not block access on transient status check failures.
      return true;
    }
    return status.fileExists !== false;
  }

  async function setServerSession(session) {
    if (!isHttpContext()) {
      return false;
    }

    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
      return response.ok;
    } catch (_) {
      return false;
    }
  }

  async function ensureMunicipalityDbFile(municipality, kind) {
    if (!isHttpContext()) {
      return false;
    }

    const safeMunicipality = normalizeText(municipality).toUpperCase();
    const datasetKind = String(kind || "csr").trim().toLowerCase() === "scsr"
      ? "scsr"
      : "csr";
    if (!safeMunicipality) {
      return false;
    }

    try {
      const response = await fetch("/api/csr/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ municipality: safeMunicipality, kind: datasetKind }),
      });
      if (!response.ok) {
        return false;
      }
      const payload = await response.json();
      return !!(payload && payload.ok && payload.ensured);
    } catch (_) {
      return false;
    }
  }

  async function clearServerSession() {
    if (!isHttpContext()) {
      return false;
    }

    try {
      const response = await fetch("/api/session", { method: "DELETE" });
      return response.ok;
    } catch (_) {
      return false;
    }
  }

  function isHttpContext() {
    return location.protocol === "http:" || location.protocol === "https:";
  }

  async function verifyRequiredFilesInDownloads(fileNames) {
    if (isHttpContext()) {
      try {
        const response = await fetch("/api/downloads/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: Array.isArray(fileNames) ? fileNames : [],
          }),
        });
        if (response.ok) {
          const payload = await response.json();
          if (payload && payload.ok) {
            return {
              allPresent: payload.allPresent === true,
              missing: Array.isArray(payload.missing) ? payload.missing : [],
            };
          }
        }
      } catch (_) {
        // Fall back to directory handle path checks below.
      }
    }

    const missing = [];

    for (const fileName of fileNames) {
      const exists = await fileExistsInDownloads(fileName);
      if (!exists) {
        missing.push(fileName);
      }
    }

    return {
      allPresent: missing.length === 0,
      missing: missing,
    };
  }

  function getExpectedRequiredDownloadFiles(sessionLike) {
    const fileSet = new Set();
    const fromSession = Array.isArray(sessionLike && sessionLike.files)
      ? sessionLike.files
      : [];
    fromSession.forEach((name) => {
      const normalized = normalizeText(name);
      if (normalized) {
        fileSet.add(normalized);
      }
    });
    fileSet.add(`${toSheetJsonBaseName(LOGIN_SHEET)}.json`);
    const municipality = normalizeText(sessionLike && sessionLike.municipality).toUpperCase();
    if (municipality) {
      fileSet.add(`${toSheetJsonBaseName(municipality)}.json`);
    }
    return Array.from(fileSet);
  }

  async function hasRequiredMunicipalityFileInDownloads(sessionLike) {
    const municipality = normalizeText(sessionLike && sessionLike.municipality).toUpperCase();
    if (!municipality) {
      return true;
    }
    const canonicalFile = `${toSheetJsonBaseName(municipality)}.json`;
    const legacyFile = `${toSafeSheetName(municipality)}.json`;
    return (
      (await fileExistsInDownloads(canonicalFile)) ||
      (await fileExistsInDownloads(legacyFile))
    );
  }

  async function fileExistsInDownloads(fileName) {
    if (!downloadsDirectoryHandle) {
      return false;
    }

    try {
      await downloadsDirectoryHandle.getFileHandle(fileName);
      return true;
    } catch (error) {
      if (error && error.name === "NotFoundError") {
        return false;
      }
      throw error;
    }
  }

  async function saveOrDownloadSheetJson(sheetName, data) {
    const safeSheetName = toSheetJsonBaseName(sheetName);
    const fileName = `${safeSheetName}.json`;
    const json = JSON.stringify(data, null, 2);
    if (isHttpContext()) {
      const savedViaServer = await saveSheetJsonViaServer(sheetName, data);
      if (savedViaServer) {
        return { fileName, savedToProject: true };
      }
    }
    const savedToProject = await saveJsonToProjectDownloads(fileName, json);

    if (savedToProject) {
      return { fileName, savedToProject: true };
    }

    downloadJsonFile(fileName, json);
    return { fileName, savedToProject: false };
  }

  async function saveSheetJsonViaServer(sheetName, rows) {
    if (!isHttpContext()) {
      return false;
    }
    lastSheetServerWriteError = "";
    try {
      const response = await fetch("/api/downloads/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetName: String(sheetName || "").trim(),
          data: Array.isArray(rows) ? rows : [],
        }),
      });
      if (!response.ok) {
        try {
          const payload = await response.json();
          const errorText =
            payload && typeof payload.error === "string" ? payload.error : "";
          const codeText = payload && payload.code ? String(payload.code) : "";
          const detailText =
            payload && typeof payload.detail === "string" ? payload.detail : "";
          const parts = [
            `HTTP ${response.status}`,
            errorText,
            codeText,
            detailText,
          ].filter(Boolean);
          lastSheetServerWriteError = parts.join(" | ");
        } catch (_) {
          lastSheetServerWriteError = `HTTP ${response.status}`;
        }
        return false;
      }
      const payload = await response.json();
      return !!(payload && payload.ok);
    } catch (_) {
      lastSheetServerWriteError = "Network error while saving municipality JSON.";
      return false;
    }
  }

  async function getRuntimeWriteFailureHint() {
    const origin = isHttpContext() ? location.origin : "";
    if (!isHttpContext()) {
      return "";
    }
    try {
      const response = await fetch("/api/runtime/diagnostics", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        return origin ? `Server: ${origin}` : "";
      }
      const payload = await response.json();
      const diagnostics = payload && payload.diagnostics ? payload.diagnostics : null;
      if (!diagnostics || !diagnostics.downloadsDirPath) {
        return [
          origin ? `Server: ${origin}` : "",
          lastSheetServerWriteError ? `Cause: ${lastSheetServerWriteError}` : "",
        ]
          .filter(Boolean)
          .join(" ");
      }
      const portSuffix =
        diagnostics.port !== undefined && diagnostics.port !== null
          ? ` (port ${diagnostics.port})`
          : "";
      return [
        `Check folder: ${diagnostics.downloadsDirPath}${portSuffix}`,
        lastSheetServerWriteError ? `Cause: ${lastSheetServerWriteError}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    } catch (_) {
      return [
        origin ? `Server: ${origin}` : "",
        lastSheetServerWriteError ? `Cause: ${lastSheetServerWriteError}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    }
  }

  function downloadJsonFile(fileName, json) {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function saveJsonToProjectDownloads(fileName, json) {
    if (typeof window.showDirectoryPicker !== "function") {
      return false;
    }

    if (!downloadsDirectoryHandle) {
      return false;
    }

    try {
      const fileHandle = await downloadsDirectoryHandle.getFileHandle(fileName, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();

      return true;
    } catch (error) {
      if (error && error.name === "AbortError") {
        showToast("Folder selection cancelled. Using browser download instead.");
      } else if (error && error.name === "NotAllowedError") {
        showToast("Folder write permission denied. Using browser download instead.");
      } else if (error && error.name === "SecurityError") {
        showToast("Browser blocked folder access. Using browser download instead.");
      }
      return false;
    }
  }

  async function selectDownloadsDirectory() {
    try {
      showToast(
        `Select your ${PROJECT_DOWNLOADS_DIR_LABEL} folder to save files automatically.`,
        "success"
      );
      downloadsDirectoryHandle = await window.showDirectoryPicker({
        mode: "readwrite",
      });
      await storeDownloadsDirectoryHandle(downloadsDirectoryHandle);
      return true;
    } catch (error) {
      if (error && error.name === "AbortError") {
        showToast("Folder selection cancelled. Using browser download instead.");
      } else if (error && error.name === "NotAllowedError") {
        showToast("Folder write permission denied. Using browser download instead.");
      } else if (error && error.name === "SecurityError") {
        showToast("Browser blocked folder picker. Using browser download instead.");
      }
      return false;
    }
  }

  async function storeDownloadsDirectoryHandle(handle) {
    try {
      const db = await openDownloadsHandleDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(DOWNLOADS_HANDLE_STORE, "readwrite");
        const store = tx.objectStore(DOWNLOADS_HANDLE_STORE);
        store.put(handle, DOWNLOADS_HANDLE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (_) {
      // Ignore persistence failures and keep runtime flow working.
    }
  }

  async function getStoredDownloadsDirectoryHandle() {
    try {
      const db = await openDownloadsHandleDb();
      const handle = await new Promise((resolve, reject) => {
        const tx = db.transaction(DOWNLOADS_HANDLE_STORE, "readonly");
        const store = tx.objectStore(DOWNLOADS_HANDLE_STORE);
        const request = store.get(DOWNLOADS_HANDLE_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (!handle) {
        return null;
      }

      const permission = await handle.queryPermission({ mode: "readwrite" });
      if (permission !== "granted") {
        return null;
      }

      return handle;
    } catch (_) {
      return null;
    }
  }

  function openDownloadsHandleDb() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB not available"));
        return;
      }

      const request = indexedDB.open(DOWNLOADS_HANDLE_DB, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DOWNLOADS_HANDLE_STORE)) {
          db.createObjectStore(DOWNLOADS_HANDLE_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function setFieldError(inputElement, errorElement, message) {
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove("hidden");
    }

    inputElement.classList.add("border-red-500", "focus:border-red-500");
  }

  function clearFieldError(inputElement, errorElement) {
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.add("hidden");
    }

    inputElement.classList.remove("border-red-500", "focus:border-red-500");
  }

  function showDataTableCard() {
    if (!dataTableCard) {
      return;
    }

    dataTableCard.classList.remove("hidden");
  }

  function showDataTableHeader() {
    if (!dataTableHeader) {
      return;
    }

    dataTableHeader.classList.remove("hidden");
  }

  function setAppBootScreenVisible(isVisible) {
    if (!appBootScreen) {
      return;
    }
    appBootScreen.classList.toggle("hidden", !isVisible);
    appBootScreen.classList.toggle("flex", !!isVisible);
  }

  function setMainContentVisible(isVisible) {
    if (!appMain) {
      return;
    }

    appMain.classList.toggle("hidden", !isVisible);
  }

  function setLoginScreenActive(isActive) {
    if (!document.body) {
      return;
    }

    document.body.classList.toggle("login-screen-active", !!isActive);
  }

  function hideLoginSection() {
    if (!loginSection) {
      return;
    }

    loginSection.classList.add("hidden");
    loginSection.classList.remove("flex");
  }

  async function showPostLoginUI() {
    setAppBootScreenVisible(false);
    setMainContentVisible(true);
    setLoginScreenActive(false);
    hideCsrWorkspace();
    showDataTableHeader();
    hideLoginSection();
    serverLogoutToastShown = false;
    pendingRestoreSession = null;
    void initializeCardsDataTable();
    const deepLink = consumePendingCsrDeepLink();
    const currentViewState = getCsrViewState();
    const shouldRestoreWorkspace =
      !deepLink &&
      !!currentViewState && currentViewState.mode === "workspace";
    let restoredWorkspace = false;
    if (shouldRestoreWorkspace) {
      restoredWorkspace = await restoreCsrWorkspaceFromViewState();
    }
    if (!restoredWorkspace && deepLink) {
      restoredWorkspace = await restoreCsrWorkspaceFromDeepLink(deepLink);
    }

    if (!restoredWorkspace) {
      showDataTableCard();
    }

    const shouldScrollToCards = !restoredWorkspace;
    if (
      shouldScrollToCards &&
      dataTableCard &&
      typeof dataTableCard.scrollIntoView === "function"
    ) {
      dataTableCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function initializeCardsDataTable() {
    const municipality = getActiveMunicipalityForCards();
    activeMunicipalityForCards = municipality;
    if (!municipality) {
      allCardRecords = [];
      filteredCardRecords = [];
      currentCardsPage = 1;
      renderCardPage();
      stopMunicipalityChangeWatcher();
      return;
    }

    currentCardsPage = getSavedCardsPage(municipality);
    const cachedCards = getCachedCards(municipality);
    hasPendingMunicipalityUpdate =
      getMunicipalityUpdatePending(municipality) || getOrphanCleanupPending(municipality);
    setUpdateDataButtonVisible(hasPendingMunicipalityUpdate);
    if (cachedCards && Array.isArray(cachedCards.records)) {
      allCardRecords = cachedCards.records;
      setupBarangayFilter(allCardRecords);
      setupStatusFilter(allCardRecords);
      applyCardFiltersAndRender();
    } else {
      setCardsLoading(true);
    }

    try {
      const municipalityRows = await loadMunicipalityRecordsForCards(municipality);
      await applyMunicipalityRowsToCards(municipalityRows, municipality, {
        runOrphanCleanup: false,
      });
      currentMunicipalityFingerprint = createRowsFingerprint(municipalityRows);
      if (!hasPendingMunicipalityUpdate) {
        pendingMunicipalityRows = null;
        hasPendingMunicipalityUpdate = false;
        setUpdateDataButtonVisible(false);
      }
      startMunicipalityChangeWatcher();
      void checkMunicipalityChangeOnline();
    } catch (error) {
      maybeShowDatasetOfflinePopup(error);
      allCardRecords = [];
      filteredCardRecords = [];
      currentCardsPage = 1;
      renderCardPage();
      showToast("Unable to load municipality card data.");
    } finally {
      setCardsLoading(false);
    }
  }

  function getActiveMunicipalityForCards() {
    const uiSession = getUiSession();
    if (uiSession && uiSession.municipality) {
      return String(uiSession.municipality).trim().toUpperCase();
    }

    const oneTimeState = getOneTimeLoginState();
    if (oneTimeState && oneTimeState.municipality) {
      return String(oneTimeState.municipality).trim().toUpperCase();
    }

    return "";
  }

  async function loadMunicipalityRecordsForCards(municipality) {
    const municipalityFileName = `${toSheetJsonBaseName(municipality)}.json`;
    const legacyMunicipalityFileName = `${toSafeSheetName(municipality)}.json`;

    if (!downloadsDirectoryHandle) {
      downloadsDirectoryHandle = await getStoredDownloadsDirectoryHandle();
    }

    if (downloadsDirectoryHandle) {
      try {
        let fileHandle;
        try {
          fileHandle = await downloadsDirectoryHandle.getFileHandle(
            municipalityFileName
          );
        } catch (error) {
          if (error && error.name === "NotFoundError") {
            fileHandle = await downloadsDirectoryHandle.getFileHandle(
              legacyMunicipalityFileName
            );
          } else {
            throw error;
          }
        }
        const file = await fileHandle.getFile();
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (_) {
        // Fall back to API fetch.
      }
    }

    return fetchSheetData(municipality, false);
  }

  function isGranteeRecord(record) {
    const grantee = normalizeText(record && record.GRANTEE).toUpperCase();
    return grantee === "YES";
  }

  function setCardsLoading(isLoading) {
    if (dataLoader) {
      dataLoader.classList.toggle("hidden", !isLoading);
    }
    if (householdGrid) {
      householdGrid.classList.toggle("hidden", isLoading);
    }
  }

  async function applyMunicipalityRowsToCards(rows, municipality, options) {
    const config = {
      runOrphanCleanup: false,
      showCleanupErrorToast: false,
      ...options,
    };
    const freshRecords = rows
      .filter((row) => isGranteeRecord(row))
      .map((row) => ({
        name: normalizeText(row.NAMES),
        hhid: normalizeText(row.HH_ID),
        municipality: normalizeMunicipalitySheetName(
          normalizeText(row.MUNICIPALITY) || municipality
        ),
        barangay: normalizeText(row.BARANGAY),
        status: normalizeText(row.CLIENT_STATUS),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    allCardRecords = freshRecords;
    setCachedCards(municipality, freshRecords);
    setupBarangayFilter(allCardRecords);
    setupStatusFilter(allCardRecords);
    applyCardFiltersAndRender();
    if (config.runOrphanCleanup) {
      const cleanupResult = await cleanupOrphanCsrRecordsForMunicipality(rows, municipality);
      if (!cleanupResult.ok) {
        setOrphanCleanupPending(municipality, true);
        if (config.showCleanupErrorToast) {
          const details = cleanupResult.error ? ` (${cleanupResult.error})` : "";
          showToast(`CSR cleanup pending. Please retry update${details}`);
        }
      } else {
        setOrphanCleanupPending(municipality, false);
      }
    }
  }

  async function cleanupOrphanCsrRecordsForMunicipality(rows, municipality) {
    const safeMunicipality = normalizeText(municipality).toUpperCase();
    if (!safeMunicipality || !isHttpContext()) {
      return { ok: true };
    }
    const validHouseholdIds = Array.from(
      new Set(
        (Array.isArray(rows) ? rows : [])
          .filter((row) => isGranteeRecord(row))
          .map((row) => normalizeText(row && row.HH_ID))
          .filter(Boolean)
      )
    );

    try {
      const response = await fetch("/api/csr/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          municipality: safeMunicipality,
          validHouseholdIds,
        }),
      });
      if (!response.ok) {
        let errorMessage = "";
        try {
          const payload = await response.json();
          errorMessage = normalizeText(payload && payload.error);
        } catch (_) {
          errorMessage = "";
        }
        return { ok: false, error: errorMessage || `HTTP ${response.status}` };
      }
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: normalizeText(error && error.message) || "Network error",
      };
    }
  }

  function createRowsFingerprint(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return "0:0";
    }
    // Faster fingerprint than deep stable stringify for large datasets.
    let hash = 2166136261;
    const prime = 16777619;

    // Include schema (column names) so newly added keys trigger update detection.
    const schemaRow = rows.find((row) => row && typeof row === "object") || {};
    const schemaKey = Object.keys(schemaRow)
      .map((key) => normalizeText(key).toUpperCase())
      .sort()
      .join("|");
    for (let i = 0; i < schemaKey.length; i += 1) {
      hash ^= schemaKey.charCodeAt(i);
      hash = Math.imul(hash, prime);
    }

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i] || {};
      const rowKey = [
        normalizeText(row.HH_ID),
        normalizeText(row.ENTRY_ID),
        normalizeText(row.NAMES),
        normalizeText(row.PRESENT_ADDRESS),
        normalizeText(row.CLIENT_STATUS),
        normalizeText(row.MEMBER_STATUS),
        normalizeText(row.GRANTEE),
      ].join("|");
      for (let j = 0; j < rowKey.length; j += 1) {
        hash ^= rowKey.charCodeAt(j);
        hash = Math.imul(hash, prime);
      }
      hash ^= i;
      hash = Math.imul(hash, prime);
    }
    return `${rows.length}:${(hash >>> 0).toString(16)}`;
  }

  function getCachedCards(municipality) {
    try {
      const key = `${CARD_CACHE_KEY_PREFIX}${toSafeSheetName(municipality)}`;
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.records)) {
        return null;
      }
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function setCachedCards(municipality, records) {
    try {
      const key = `${CARD_CACHE_KEY_PREFIX}${toSafeSheetName(municipality)}`;
      window.localStorage.setItem(
        key,
        JSON.stringify({
          updatedAt: new Date().toISOString(),
          records: records,
        })
      );
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function clearCardsCache() {
    try {
      const keysToDelete = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(CARD_CACHE_KEY_PREFIX)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach((key) => window.localStorage.removeItem(key));
      allCardRecords = [];
      filteredCardRecords = [];
      currentCardsPage = 1;
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function resetMunicipalityUpdateState() {
    if (activeMunicipalityForCards) {
      setMunicipalityUpdatePending(activeMunicipalityForCards, false);
    }
    stopMunicipalityChangeWatcher();
    activeMunicipalityForCards = "";
    currentMunicipalityFingerprint = "";
    pendingMunicipalityRows = null;
    hasPendingMunicipalityUpdate = false;
    setUpdateDataButtonVisible(false);
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function formatPresentAddressForDisplay(value) {
    const raw = normalizeText(value);
    if (!raw) {
      return "";
    }
    // Only auto-titlecase all-uppercase source values from datasets.
    if (raw !== raw.toUpperCase()) {
      return raw;
    }
    return raw
      .toLowerCase()
      .replace(/\b([a-z])/g, (match) => match.toUpperCase());
  }

  function toSafeSheetName(value) {
    return String(value || "").replace(/[^\w.-]+/g, "_");
  }

  function toSheetJsonBaseName(value) {
    return String(value || "")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, " ")
      .replace(/\s+/g, " ");
  }

  function getCardsPageMunicipalityKey() {
    const fromActive = normalizeText(activeMunicipalityForCards).toUpperCase();
    if (fromActive) {
      return fromActive;
    }
    return getActiveMunicipalityForCards();
  }

  function getSavedCardsPage(municipality) {
    try {
      const key = `${CARDS_PAGE_KEY_PREFIX}${toSafeSheetName(municipality)}`;
      const raw = window.localStorage.getItem(key);
      const parsed = Number(raw);
      if (!Number.isInteger(parsed) || parsed < 1) {
        return 1;
      }
      return parsed;
    } catch (_) {
      return 1;
    }
  }

  function setSavedCardsPage(municipality, page) {
    try {
      const key = `${CARDS_PAGE_KEY_PREFIX}${toSafeSheetName(municipality)}`;
      const safePage = Number.isInteger(page) && page > 0 ? page : 1;
      window.localStorage.setItem(key, String(safePage));
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function saveCurrentCardsPageState() {
    const municipalityKey = getCardsPageMunicipalityKey();
    if (!municipalityKey) {
      return;
    }
    setSavedCardsPage(municipalityKey, currentCardsPage);
  }

  function setupBarangayFilter(records) {
    if (!barangayFilter) {
      return;
    }

    const previousValue = barangayFilter.value;
    const barangays = Array.from(
      new Set(
        records
          .map((item) => normalizeText(item.barangay))
          .filter((item) => item.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));

    barangayFilter.innerHTML = '<option value="">Filter by Barangay</option>';
    barangays.forEach((barangay) => {
      const option = document.createElement("option");
      option.value = barangay;
      option.textContent = barangay;
      barangayFilter.appendChild(option);
    });

    if (previousValue && barangays.includes(previousValue)) {
      barangayFilter.value = previousValue;
    } else {
      barangayFilter.value = "";
    }
  }

  function setupStatusFilter(records) {
    if (!statusFilter) {
      return;
    }

    const previousValue = statusFilter.value;
    const statuses = Array.from(
      new Set(
        records
          .map((item) => normalizeText(item.status))
          .filter((item) => item.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));

    statusFilter.innerHTML = '<option value="">Filter by Status</option>';
    statuses.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      statusFilter.appendChild(option);
    });

    if (previousValue && statuses.includes(previousValue)) {
      statusFilter.value = previousValue;
    } else {
      statusFilter.value = "";
    }
  }

  function applyCardFiltersAndRender() {
    const searchValue = normalizeText(dataSearchInput && dataSearchInput.value)
      .toUpperCase();
    const barangayValue = normalizeText(barangayFilter && barangayFilter.value);
    const statusValue = normalizeText(statusFilter && statusFilter.value);

    filteredCardRecords = allCardRecords.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.name.toUpperCase().includes(searchValue) ||
        item.hhid.toUpperCase().includes(searchValue);
      const matchesBarangay =
        !barangayValue || item.barangay.toUpperCase() === barangayValue.toUpperCase();
      const matchesStatus =
        !statusValue || item.status.toUpperCase() === statusValue.toUpperCase();

      return matchesSearch && matchesBarangay && matchesStatus;
    });

    renderCardPage();
  }

  function renderCardPage() {
    if (!householdGrid) {
      return;
    }

    const totalEntries = filteredCardRecords.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / CARDS_PER_PAGE));
    if (currentCardsPage > totalPages) {
      currentCardsPage = totalPages;
    }
    if (currentCardsPage < 1) {
      currentCardsPage = 1;
    }

    const startIndex = totalEntries ? (currentCardsPage - 1) * CARDS_PER_PAGE : 0;
    const endIndex = Math.min(startIndex + CARDS_PER_PAGE, totalEntries);
    const pageRows = filteredCardRecords.slice(startIndex, endIndex);

    if (!pageRows.length) {
      householdGrid.innerHTML =
        '<div class="col-span-full rounded-lg border border-slate-200 bg-slate-50 p-5 text-center text-slate-500">No GRANTEE records found.</div>';
    } else {
      householdGrid.innerHTML = pageRows.map((row) => createCardMarkup(row)).join("");
    }

    if (summaryStart) {
      summaryStart.textContent = totalEntries ? String(startIndex + 1) : "0";
    }
    if (summaryEnd) {
      summaryEnd.textContent = totalEntries ? String(endIndex) : "0";
    }
    if (summaryTotal) {
      summaryTotal.textContent = String(totalEntries);
    }

    renderPagination(totalPages);
  }

  function createCardMarkup(row) {
    const safeName = escapeHtml(row.name || "N/A");
    const safeHhid = escapeHtml(row.hhid || "N/A");
    const safeMunicipality = escapeHtml(row.municipality || "N/A");
    const safeBarangay = escapeHtml(row.barangay || "N/A");
    const safeStatus = escapeHtml(row.status || "N/A");
    const statusStyle = getCardStatusBadgeStyle(row.status);
    const safeStatusBg = escapeHtml(statusStyle.background);
    const safeStatusText = escapeHtml(statusStyle.text);
    const encodedName = escapeHtml(row.name || "");
    const encodedHhid = escapeHtml(row.hhid || "");
    const encodedMunicipality = escapeHtml(row.municipality || "");
    const encodedBarangay = escapeHtml(row.barangay || "");

    return `
      <article class="flex flex-col bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group">
        <div class="p-5 flex flex-col gap-4 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div>
                <h3 class="text-[#111418] text-lg font-bold font-lexend leading-tight">${safeName}</h3>
                <p class="text-[#617589] text-base font-lexend font-medium mt-0.5">${safeHhid}</p>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2 mt-1">
            <div class="flex flex-col gap-1 text-sm text-[#3e4c59]">
              <span class="text-base text-[#617589] font-medium uppercase font-lexend tracking-wide">Municipality</span>
              <span class="font-semibold text-[#111418] font-lexend text-base">${safeMunicipality}</span>
            </div>
          </div>
          <div class="flex flex-col gap-1 text-sm text-[#3e4c59]">
            <span class="text-base text-[#617589] font-medium uppercase font-lexend tracking-wide">Barangay</span>
            <span class="font-semibold text-[#111418] font-lexend text-base">${safeBarangay}</span>
          </div>
          <div class="flex flex-col items-start gap-1 text-sm text-[#3e4c59]">
            <span class="text-base text-[#617589] font-medium font-lexend uppercase tracking-wide">Status</span>
            <span class="inline-flex items-center leading-tight font-lexend rounded-full px-4 py-1 text-base font-medium border border-black/10" style="background:${safeStatusBg};color:${safeStatusText};">${safeStatus}</span>
          </div>
        </div>
        <div class="p-4 border-t border-[#f0f2f4] bg-gray-50/50">
          <button class="create-csr-btn flex w-full items-center justify-center font-lexend rounded-lg h-12 bg-white border border-[#dbe0e6] text-primary text-lg font-bold shadow-sm hover:bg-primary hover:text-white transition-all" data-name="${encodedName}" data-hhid="${encodedHhid}" data-municipality="${encodedMunicipality}" data-barangay="${encodedBarangay}" type="button">
            Create
          </button>
        </div>
      </article>`;
  }

  function getCardStatusBadgeStyle(status) {
    const raw = normalizeText(status);
    const codeMatch = raw.match(/^(\d+)\s*-/);
    const code = codeMatch ? Number.parseInt(codeMatch[1], 10) : NaN;
    if (Number.isFinite(code) && Object.prototype.hasOwnProperty.call(CARD_STATUS_STYLE_BY_CODE, code)) {
      return CARD_STATUS_STYLE_BY_CODE[code];
    }
    return CARD_STATUS_STYLE_BY_CODE.default;
  }

  function renderPagination(totalPages) {
    if (!pageNumbersContainer) {
      return;
    }

    pageNumbersContainer.innerHTML = "";
    const maxVisiblePages = 5;
    const halfWindow = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentCardsPage - halfWindow);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(page);
      button.className =
        page === currentCardsPage
          ? "relative z-10 inline-flex items-center bg-primary px-5 py-3 text-base font-semibold text-white"
          : "relative inline-flex items-center px-5 py-3 text-base font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50";
      button.addEventListener("click", () => {
        currentCardsPage = page;
        saveCurrentCardsPageState();
        renderCardPage();
      });
      pageNumbersContainer.appendChild(button);
    }

    if (pagePrevButton) {
      pagePrevButton.disabled = currentCardsPage <= 1;
      pagePrevButton.classList.toggle("opacity-50", currentCardsPage <= 1);
    }
    if (pageNextButton) {
      pageNextButton.disabled = currentCardsPage >= totalPages;
      pageNextButton.classList.toggle("opacity-50", currentCardsPage >= totalPages);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showLoginUI() {
    setAppBootScreenVisible(false);
    setMainContentVisible(false);
    setLoginScreenActive(true);
    hideCsrWorkspace();
    if (loginSection) {
      loginSection.classList.remove("hidden");
      loginSection.classList.add("flex");
    }
    if (dataTableHeader) {
      dataTableHeader.classList.add("hidden");
    }
    if (dataTableCard) {
      dataTableCard.classList.add("hidden");
    }
    if (loginButton) {
      loginButton.classList.remove("hidden");
    }
    if (restoreSessionButton) {
      restoreSessionButton.classList.add("hidden");
    }
    if (loginIdField) {
      loginIdField.classList.remove("hidden");
    }
    if (loginMunicipalityField) {
      loginMunicipalityField.classList.remove("hidden");
    }
    setUpdateDataButtonVisible(false);
  }

  function showRestoreOnlyUI() {
    setAppBootScreenVisible(false);
    setMainContentVisible(false);
    setLoginScreenActive(true);
    hideCsrWorkspace();
    if (loginSection) {
      loginSection.classList.remove("hidden");
      loginSection.classList.add("flex");
    }
    if (dataTableHeader) {
      dataTableHeader.classList.add("hidden");
    }
    if (dataTableCard) {
      dataTableCard.classList.add("hidden");
    }
    if (loginButton) {
      loginButton.classList.add("hidden");
    }
    if (restoreSessionButton) {
      restoreSessionButton.classList.remove("hidden");
    }
    if (loginIdField) {
      loginIdField.classList.add("hidden");
    }
    if (loginMunicipalityField) {
      loginMunicipalityField.classList.add("hidden");
    }
    setUpdateDataButtonVisible(false);
  }

  function setUpdateDataButtonVisible(isVisible) {
    if (!updateDataButton) {
      return;
    }
    updateDataButton.classList.toggle("hidden", !isVisible);
  }

  function startMunicipalityChangeWatcher() {
    stopMunicipalityChangeWatcher();
    if (!isMunicipalityPollingAllowed()) {
      return;
    }
    municipalityWatcherId = window.setInterval(() => {
      console.log(`[municipality-watcher] checking ${activeMunicipalityForCards} at ${new Date().toISOString()} (${MUNICIPALITY_CHANGE_CHECK_MS}ms interval)`);
      void checkMunicipalityChangeOnline();
    }, MUNICIPALITY_CHANGE_CHECK_MS);
  }

  function stopMunicipalityChangeWatcher() {
    if (municipalityWatcherId !== null) {
      window.clearInterval(municipalityWatcherId);
      municipalityWatcherId = null;
    }
  }

  function isMunicipalityPollingAllowed() {
    return Boolean(activeMunicipalityForCards) && document.visibilityState === "visible";
  }

  function handleDocumentVisibilityChange() {
    if (!activeMunicipalityForCards) {
      return;
    }
    if (isMunicipalityPollingAllowed()) {
      startMunicipalityChangeWatcher();
      void checkMunicipalityChangeOnline();
      return;
    }
    stopMunicipalityChangeWatcher();
  }

  async function checkMunicipalityChangeOnline() {
    if (!isMunicipalityPollingAllowed() || hasPendingMunicipalityUpdate) {
      return;
    }
    if (municipalityCheckInFlight) {
      return;
    }

    municipalityCheckInFlight = true;
    try {
      let changed = false;
      let compareHandled = false;
      try {
        const compare = await fetchMunicipalitySheetCompareFromApi(activeMunicipalityForCards);
        if (compare && compare.ok === true) {
          changed = Boolean(compare.changed);
          compareHandled = true;
        }
      } catch (_) {
        compareHandled = false;
      }

      if (!compareHandled) {
        const onlineRows = await fetchSheetData(activeMunicipalityForCards, true);
        const onlineFingerprint = createRowsFingerprint(onlineRows);
        changed =
          Boolean(currentMunicipalityFingerprint) &&
          onlineFingerprint !== currentMunicipalityFingerprint;
      }

      if (changed) {
        pendingMunicipalityRows = null;
        hasPendingMunicipalityUpdate = true;
        setMunicipalityUpdatePending(activeMunicipalityForCards, true);
        setUpdateDataButtonVisible(true);
        return;
      }

      pendingMunicipalityRows = null;
      setMunicipalityUpdatePending(activeMunicipalityForCards, false);
      const orphanCleanupPending = getOrphanCleanupPending(activeMunicipalityForCards);
      hasPendingMunicipalityUpdate = orphanCleanupPending;
      setUpdateDataButtonVisible(orphanCleanupPending);
    } catch (_) {
      // Ignore background detection errors.
    } finally {
      municipalityCheckInFlight = false;
    }
  }

  async function handleUpdateDataClick() {
    if (!activeMunicipalityForCards) {
      return;
    }

    if (updateDataButton) {
      updateDataButton.disabled = true;
    }
    setCardsLoading(true);

    try {
      const latestRows =
        pendingMunicipalityRows ||
        (await fetchSheetData(activeMunicipalityForCards, true));

      const municipalitySaveResult = await silentlySaveMunicipalityJson(
        activeMunicipalityForCards,
        latestRows
      );
      if (municipalitySaveResult === "failed") {
        showToast(
          "Update blocked: unable to write municipality JSON file. Please grant folder permission and try again."
        );
        return;
      }

      await applyMunicipalityRowsToCards(latestRows, activeMunicipalityForCards, {
        runOrphanCleanup: true,
        showCleanupErrorToast: true,
      });
      if (
        currentCsrRecord &&
        normalizeText(currentCsrRecord.cardData && currentCsrRecord.cardData.municipality)
          .toUpperCase() === activeMunicipalityForCards
      ) {
        if (activeCsrStep === 1) {
          await populateBasicInfoFromSelectedCard(
            currentCsrRecord.cardData,
            currentCsrRecord.csrId
          );
        }
        if (activeCsrStep === 2) {
          await populateFamilyCompositionFromSelectedCard(currentCsrRecord.cardData);
        }
      }
      currentMunicipalityFingerprint = createRowsFingerprint(latestRows);
      pendingMunicipalityRows = null;
      setMunicipalityUpdatePending(activeMunicipalityForCards, false);
      const orphanCleanupPending = getOrphanCleanupPending(activeMunicipalityForCards);
      hasPendingMunicipalityUpdate = orphanCleanupPending;
      setUpdateDataButtonVisible(orphanCleanupPending);
      if (municipalitySaveResult === "storage_write_failed") {
        const hint = await getRuntimeWriteFailureHint();
        showToast(
          `Municipality data updated, but local file save is blocked on this device. Please check folder permissions.${hint ? ` ${hint}` : ""}`,
          "error",
          5000
        );
      } else if (municipalitySaveResult === "server_write_failed") {
        const hint = await getRuntimeWriteFailureHint();
        showToast(
          `Municipality data updated, but app storage write failed on this device. Please check folder permissions.${hint ? ` ${hint}` : ""}`,
          "error",
          5000
        );
      } else if (orphanCleanupPending) {
        showToast("Municipality data updated. CSR cleanup still pending.");
      } else {
        showToast("Municipality data updated.", "success", 3000);
      }
    } catch (error) {
      maybeShowDatasetOfflinePopup(error);
      showToast("Unable to update municipality data right now.");
    } finally {
      setCardsLoading(false);
      if (updateDataButton) {
        updateDataButton.disabled = false;
      }
    }
  }

  async function silentlySaveMunicipalityJson(sheetName, rows) {
    const fileName = `${toSheetJsonBaseName(sheetName)}.json`;
    const json = JSON.stringify(rows, null, 2);

    if (isHttpContext()) {
      const savedViaServer = await saveSheetJsonViaServer(sheetName, rows);
      if (savedViaServer) {
        return "saved";
      }
      // In Electron HTTP mode, avoid browser download fallback because it prompts Save As.
      // Keep update flow non-blocking and surface a warning toast instead.
      return "server_write_failed";
    }

    const initialHandleReady = await ensureDownloadsDirectoryWriteAccess(false);
    if (!initialHandleReady) {
      return "storage_write_failed";
    }

    try {
      const wroteToHandle = await writeMunicipalityJsonToHandle(
        downloadsDirectoryHandle,
        fileName,
        json
      );
      return wroteToHandle ? "saved" : "failed";
    } catch (error) {
      if (!isRecoverableWriteError(error)) {
        return "storage_write_failed";
      }

      // Stored handle may be stale or permission may have changed.
      // Do not invoke picker here because user activation may no longer be available.
      downloadsDirectoryHandle = null;
      const recoveredHandleReady = await ensureDownloadsDirectoryWriteAccess(false);
      if (!recoveredHandleReady) {
        return "storage_write_failed";
      }

      try {
        const wroteAfterRecovery = await writeMunicipalityJsonToHandle(
          downloadsDirectoryHandle,
          fileName,
          json
        );
        return wroteAfterRecovery ? "saved" : "failed";
      } catch (_) {
        return "storage_write_failed";
      }
    }
  }

  async function ensureDownloadsDirectoryWriteAccess(allowPicker) {
    if (!downloadsDirectoryHandle) {
      downloadsDirectoryHandle = await getStoredDownloadsDirectoryHandle();
    }

    if (downloadsDirectoryHandle) {
      try {
        const hasPermission = await requestReadWritePermission(downloadsDirectoryHandle);
        if (hasPermission) {
          return true;
        }
      } catch (_) {
        downloadsDirectoryHandle = null;
      }
    }

    if (!allowPicker || typeof window.showDirectoryPicker !== "function") {
      return false;
    }

    try {
      downloadsDirectoryHandle = await window.showDirectoryPicker({
        mode: "readwrite",
      });
      const hasPermission = await requestReadWritePermission(downloadsDirectoryHandle);
      if (!hasPermission) {
        downloadsDirectoryHandle = null;
        return false;
      }
      await storeDownloadsDirectoryHandle(downloadsDirectoryHandle);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function requestReadWritePermission(handle) {
    if (!handle) {
      return false;
    }

    if (typeof handle.queryPermission === "function") {
      const currentPermission = await handle.queryPermission({ mode: "readwrite" });
      if (currentPermission === "granted") {
        return true;
      }
    }

    if (typeof handle.requestPermission === "function") {
      const requestedPermission = await handle.requestPermission({ mode: "readwrite" });
      return requestedPermission === "granted";
    }

    // If requestPermission is unavailable, rely on write attempt later.
    return true;
  }

  function isRecoverableWriteError(error) {
    const name = error && error.name ? String(error.name) : "";
    return (
      name === "NotAllowedError" ||
      name === "SecurityError" ||
      name === "InvalidStateError" ||
      name === "NotFoundError"
    );
  }

  async function writeMunicipalityJsonToHandle(handle, fileName, json) {
    if (!handle) {
      return false;
    }

    const fileHandle = await handle.getFileHandle(fileName, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(json);
    await writable.close();
    return true;
  }

  function getMunicipalityUpdatePending(municipality) {
    try {
      const key = `${UPDATE_PENDING_KEY_PREFIX}${toSafeSheetName(municipality)}`;
      return window.localStorage.getItem(key) === "1";
    } catch (_) {
      return false;
    }
  }

  function setMunicipalityUpdatePending(municipality, isPending) {
    try {
      const key = `${UPDATE_PENDING_KEY_PREFIX}${toSafeSheetName(municipality)}`;
      if (isPending) {
        window.localStorage.setItem(key, "1");
      } else {
        window.localStorage.removeItem(key);
      }
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function getOrphanCleanupPending(municipality) {
    try {
      const key = `${ORPHAN_CLEANUP_PENDING_KEY_PREFIX}${toSafeSheetName(municipality)}`;
      return window.localStorage.getItem(key) === "1";
    } catch (_) {
      return false;
    }
  }

  function setOrphanCleanupPending(municipality, isPending) {
    try {
      const key = `${ORPHAN_CLEANUP_PENDING_KEY_PREFIX}${toSafeSheetName(municipality)}`;
      if (isPending) {
        window.localStorage.setItem(key, "1");
      } else {
        window.localStorage.removeItem(key);
      }
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function startServerSessionWatcher() {
    if (!isHttpContext() || typeof window.EventSource === "undefined") {
      return;
    }

    if (sessionEventSource) {
      sessionEventSource.close();
    }

    sessionEventSource = new EventSource("/api/session/stream");
    sessionEventSource.addEventListener("session", (event) => {
      try {
        const payload = JSON.parse(event.data || "{}");
        void checkServerSessionLive(payload && payload.session ? payload.session : null);
      } catch (_) {
        // Ignore malformed stream payloads.
      }
    });
  }

  async function checkServerSessionLive(serverSessionFromStream) {
    const uiSession = getUiSession();
    if (!uiSession || !uiSession.loggedIn) {
      return;
    }

    const serverSession =
      typeof serverSessionFromStream === "undefined"
        ? await getServerSession()
        : serverSessionFromStream;
    if (serverSession && serverSession.loggedIn) {
      const oneTimeState = getOneTimeLoginState();
      if (
        oneTimeState &&
        Array.isArray(oneTimeState.files) &&
        oneTimeState.files.length
      ) {
        if (!downloadsDirectoryHandle) {
          downloadsDirectoryHandle = await getStoredDownloadsDirectoryHandle();
        }

        if (downloadsDirectoryHandle) {
          const expectedFiles = getExpectedRequiredDownloadFiles(oneTimeState);
          const existingFiles = await verifyRequiredFilesInDownloads(expectedFiles);
          const hasMunicipalityFile = await hasRequiredMunicipalityFileInDownloads(
            oneTimeState
          );
          if (!existingFiles.allPresent || !hasMunicipalityFile) {
            pendingRestoreSession = null;
            clearOneTimeLoginState();
            showLoginUI();
            if (!serverLogoutToastShown) {
              showToast("Required files were deleted. Please login again.");
              serverLogoutToastShown = true;
            }
            return;
          }
        }
      }

      serverLogoutToastShown = false;
      return;
    }

    clearLocalSessionState();
    await showRestoreOrLoginUI();
    if (!serverLogoutToastShown) {
      if (pendingRestoreSession) {
        showToast("Server session removed. Use Restore Session.", "success");
      } else {
        showToast("Server session removed. Please login again.");
      }
      serverLogoutToastShown = true;
    }
  }

  async function handleMissingMunicipalityDbSession(municipality) {
    pendingRestoreSession = null;
    clearLocalSessionState();
    await clearServerSession();
    showLoginUI();
    showToast("Required municipality data is missing in db. Please login again.");
  }

  async function showRestoreOrLoginUI() {
    pendingRestoreSession = await findRestorableSessionFromStoredHandle();
    if (pendingRestoreSession) {
      showRestoreOnlyUI();
      return;
    }
    showLoginUI();
  }

  async function findRestorableSessionFromStoredHandle() {
    const handle = await getStoredDownloadsDirectoryHandle();
    if (!handle) {
      return null;
    }

    const restored = await buildSessionFromDirectoryHandle(handle);
    if (!restored) {
      return null;
    }

    downloadsDirectoryHandle = handle;
    return restored;
  }

  async function buildSessionFromDirectoryHandle(directoryHandle) {
    try {
      const mlsHandle = await directoryHandle.getFileHandle("MLS.json");
      const mlsFile = await mlsHandle.getFile();
      const mlsText = await mlsFile.text();
      const mlsPayload = JSON.parse(mlsText);
      const first = Array.isArray(mlsPayload) ? mlsPayload[0] : null;
      if (!first || typeof first !== "object") {
        return null;
      }

      const id = String(first.ID || "").trim();
      const municipality = String(first.MUNICIPALITY || "")
        .trim()
        .toUpperCase();
      if (!municipality) {
        return null;
      }

      const municipalityFile = `${toSheetJsonBaseName(municipality)}.json`;
      const legacyMunicipalityFile = `${toSafeSheetName(municipality)}.json`;
      let resolvedMunicipalityFile = municipalityFile;
      try {
        await directoryHandle.getFileHandle(municipalityFile);
      } catch (error) {
        if (error && error.name === "NotFoundError") {
          await directoryHandle.getFileHandle(legacyMunicipalityFile);
          resolvedMunicipalityFile = legacyMunicipalityFile;
        } else {
          throw error;
        }
      }

      return {
        loggedIn: true,
        id: id,
        municipality: municipality,
        files: ["MLS.json", resolvedMunicipalityFile],
        loggedInAt: new Date().toISOString(),
      };
    } catch (_) {
      return null;
    }
  }

  async function handleRestoreSession() {
    if (restoreSessionButton) {
      restoreSessionButton.disabled = true;
    }

    try {
      let session = pendingRestoreSession;
      if (!session && typeof window.showDirectoryPicker === "function") {
        const selectedHandle = await window.showDirectoryPicker({
          mode: "readwrite",
        });
        const fromSelected = await buildSessionFromDirectoryHandle(selectedHandle);
        if (fromSelected) {
          downloadsDirectoryHandle = selectedHandle;
          await storeDownloadsDirectoryHandle(selectedHandle);
          session = fromSelected;
        }
      }

      if (!session) {
        showToast("No valid MLS and municipality files found. Please login again.");
        showLoginUI();
        return;
      }

      pendingRestoreSession = session;
      setUiSession({
        loggedIn: true,
        id: session.id,
        municipality: session.municipality,
      });
      setOneTimeLoginState({
        id: session.id,
        municipality: session.municipality,
        files: session.files,
        loggedInAt: session.loggedInAt,
      });
      await setServerSession(session);
      showToast("Session restored from downloaded files.", "success", 4000);
      showPostLoginUI();
    } catch (error) {
      if (error && error.name === "AbortError") {
        showToast("Restore cancelled.");
      } else {
        showToast("Unable to restore session. Please login again.");
      }
      showLoginUI();
    } finally {
      if (restoreSessionButton) {
        restoreSessionButton.disabled = false;
      }
    }
  }

  function showToast(message, type, durationMs) {
    const containerId = "app-toast-container";
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className =
        "fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const isSuccess = type === "success";
    const isPending = type === "pending";
    const hasGlobalDuration =
      typeof TOAST_GLOBAL_DURATION_MS === "number" &&
      Number.isFinite(TOAST_GLOBAL_DURATION_MS) &&
      TOAST_GLOBAL_DURATION_MS >= 0;
    const resolvedDuration = hasGlobalDuration
      ? TOAST_GLOBAL_DURATION_MS
      : typeof durationMs === "number"
      ? durationMs
      : isSuccess
      ? TOAST_SUCCESS_DURATION_MS
      : TOAST_ERROR_DURATION_MS;
    toast.className = [
      "rounded-lg px-4 py-3 shadow-lg text-sm font-medium text-white animate-[fadeIn_.2s_ease-out]",
      isSuccess ? "bg-emerald-600" : isPending ? "bg-blue-600" : "bg-red-600",
    ].join(" ");
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      if (!container.childElementCount) {
        container.remove();
      }
    }, resolvedDuration);
  }

  function upsertExportProgressToast(percent, stageLabel) {
    const containerId = "app-toast-container";
    const toastId = "csr-export-progress-toast";
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className =
        "fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2";
      document.body.appendChild(container);
    }
    let toast = document.getElementById(toastId);
    if (!toast) {
      toast = document.createElement("div");
      toast.id = toastId;
      toast.className =
        "rounded-lg px-4 py-3 shadow-lg text-sm font-medium text-white bg-blue-600 animate-[fadeIn_.2s_ease-out]";
      container.appendChild(toast);
    }
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    const stage = normalizeText(stageLabel);
    toast.textContent = stage
      ? `Exporting PDF: ${safePercent}% (${stage})`
      : `Exporting PDF: ${safePercent}%`;
  }

  function removeExportProgressToast() {
    const toast = document.getElementById("csr-export-progress-toast");
    if (!toast) {
      return;
    }
    const container = toast.parentElement;
    toast.remove();
    if (container && !container.childElementCount) {
      container.remove();
    }
  }

  function isElectronRuntime() {
    const userAgent = String(
      (window.navigator && window.navigator.userAgent) || ""
    );
    return userAgent.includes("Electron");
  }

  function getDesktopUpdaterBridge() {
    const bridge =
      window &&
      window.csrDesktopUpdater &&
      typeof window.csrDesktopUpdater === "object"
        ? window.csrDesktopUpdater
        : null;
    if (!bridge) {
      return null;
    }
    if (
      typeof bridge.getState !== "function" ||
      typeof bridge.startInstallUpdate !== "function" ||
      typeof bridge.onStatusChange !== "function"
    ) {
      return null;
    }
    return bridge;
  }

  function getBrowserAppVersion() {
    if (browserAppVersion) {
      return browserAppVersion;
    }
    const versionMeta = document.querySelector('meta[name="app-version"]');
    return normalizeText(
      versionMeta && typeof versionMeta.getAttribute === "function"
        ? versionMeta.getAttribute("content")
        : ""
    );
  }

  async function hydrateBrowserAppVersion() {
    if (getDesktopUpdaterBridge()) {
      return;
    }
    const candidates = ["../package.json", "/package.json"];
    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate, {
          cache: "no-store",
        });
        if (!response || !response.ok) {
          continue;
        }
        const payload = await response.json();
        const nextVersion = normalizeText(payload && payload.version);
        if (!nextVersion) {
          continue;
        }
        browserAppVersion = nextVersion;
        renderAppVersionBadge();
        return;
      } catch (_) {
        // Try the next same-origin package.json path.
      }
    }
    renderAppVersionBadge();
  }

  function normalizeReleaseUpdaterNotes(noteSource) {
    if (typeof noteSource === "string") {
      return noteSource
        .split(/\r?\n/)
        .map((entry) => normalizeText(entry))
        .filter(Boolean);
    }
    if (Array.isArray(noteSource)) {
      return noteSource
        .map((entry) => normalizeText(entry))
        .filter(Boolean);
    }
    return [];
  }

  function normalizeReleaseUpdaterState(payload) {
    const releaseNotes = normalizeReleaseUpdaterNotes(payload && payload.releaseNotes);
    return {
      status: normalizeText(payload && payload.status) || "disabled",
      currentVersion: normalizeText(payload && payload.currentVersion),
      latestVersion: normalizeText(payload && payload.latestVersion),
      releaseNotes: releaseNotes.length
        ? releaseNotes
        : ["Improvements and fixes included in this update."],
      message: normalizeText(payload && payload.message),
      progressPercent: Number.isFinite(Number(payload && payload.progressPercent))
        ? Math.max(0, Math.min(100, Number(payload.progressPercent)))
        : 0,
      canUpdate: Boolean(payload && payload.canUpdate),
    };
  }

  function hideReleaseUpdaterModal() {
    if (!releaseUpdaterModal) {
      return;
    }
    releaseUpdaterModal.classList.add("hidden");
    releaseUpdaterModal.classList.remove("flex");
  }

  function hideAppVersionBadge() {
    if (!appVersionBadge) {
      return;
    }
    appVersionBadge.classList.add("hidden");
  }

  function renderAppVersionBadge() {
    if (!appVersionBadge) {
      return;
    }
    const bridge = getDesktopUpdaterBridge();
    const currentVersion =
      normalizeText(releaseUpdaterState.currentVersion) || getBrowserAppVersion();
    const latestVersion = normalizeText(releaseUpdaterState.latestVersion);
    if (!currentVersion) {
      hideAppVersionBadge();
      return;
    }
    const hasNewerVersion =
      bridge &&
      latestVersion &&
      latestVersion !== currentVersion &&
      (releaseUpdaterState.status === "available" ||
        releaseUpdaterState.status === "downloading" ||
        releaseUpdaterState.status === "downloaded");
    appVersionBadge.textContent = hasNewerVersion
      ? `Version ${currentVersion} • Update available ${latestVersion}`
      : `Version ${currentVersion}`;
    appVersionBadge.classList.remove("hidden");
  }

  function showReleaseUpdaterModal() {
    if (!releaseUpdaterModal) {
      return;
    }
    releaseUpdaterModal.classList.remove("hidden");
    releaseUpdaterModal.classList.add("flex");
  }

  function shouldShowReleaseUpdaterModal() {
    if (!getDesktopUpdaterBridge()) {
      return false;
    }
    if (
      releaseUpdaterState.status === "downloading" ||
      releaseUpdaterState.status === "downloaded"
    ) {
      return true;
    }
    if (releaseUpdaterState.status !== "available") {
      return false;
    }
    return releaseUpdaterDismissedVersion !== releaseUpdaterState.latestVersion;
  }

  function renderReleaseUpdaterNotes() {
    if (!releaseUpdaterNotes) {
      return;
    }
    releaseUpdaterNotes.replaceChildren();
    const notes = normalizeReleaseUpdaterNotes(releaseUpdaterState.releaseNotes);
    notes.forEach((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      releaseUpdaterNotes.appendChild(item);
    });
  }

  function renderReleaseUpdaterModal() {
    if (!releaseUpdaterModal) {
      return;
    }

    if (!shouldShowReleaseUpdaterModal()) {
      hideReleaseUpdaterModal();
      return;
    }

    const latestVersionLabel = releaseUpdaterState.latestVersion
      ? `Version ${releaseUpdaterState.currentVersion || "Current"} to ${
          releaseUpdaterState.latestVersion
        }`
      : "A newer version of the app is ready.";
    if (releaseUpdaterVersion) {
      releaseUpdaterVersion.textContent = latestVersionLabel;
    }

    if (releaseUpdaterTitle) {
      releaseUpdaterTitle.textContent =
        releaseUpdaterState.status === "available"
          ? "Update Available"
          : "Installing Update";
    }

    if (releaseUpdaterBody) {
      if (releaseUpdaterState.status === "available") {
        releaseUpdaterBody.textContent =
          releaseUpdaterState.message ||
          "Improvements and fixes are included in this update.";
      } else if (releaseUpdaterState.status === "downloading") {
        releaseUpdaterBody.textContent =
          releaseUpdaterState.message || "Downloading update...";
      } else {
        releaseUpdaterBody.textContent =
          releaseUpdaterState.message || "Preparing installer...";
      }
    }

    renderReleaseUpdaterNotes();

    if (releaseUpdaterCancelButton) {
      const lockCancel =
        releaseUpdaterState.status === "downloading" ||
        releaseUpdaterState.status === "downloaded";
      releaseUpdaterCancelButton.disabled = lockCancel;
      releaseUpdaterCancelButton.classList.toggle("hidden", lockCancel);
    }

    if (releaseUpdaterActionButton) {
      if (releaseUpdaterState.status === "available") {
        releaseUpdaterActionButton.textContent = "Update";
        releaseUpdaterActionButton.disabled = !releaseUpdaterState.canUpdate;
      } else if (releaseUpdaterState.status === "downloading") {
        releaseUpdaterActionButton.textContent = "Downloading...";
        releaseUpdaterActionButton.disabled = true;
      } else {
        releaseUpdaterActionButton.textContent = "Installing...";
        releaseUpdaterActionButton.disabled = true;
      }
    }

    showReleaseUpdaterModal();
  }

  function applyReleaseUpdaterState(payload) {
    releaseUpdaterState = normalizeReleaseUpdaterState(payload);
    renderAppVersionBadge();
    renderReleaseUpdaterModal();
  }

  function initReleaseUpdaterUi() {
    const bridge = getDesktopUpdaterBridge();
    if (!bridge || !releaseUpdaterModal) {
      hideReleaseUpdaterModal();
      hideAppVersionBadge();
      return;
    }

    if (releaseUpdaterCancelButton) {
      releaseUpdaterCancelButton.addEventListener("click", () => {
        releaseUpdaterDismissedVersion = normalizeText(releaseUpdaterState.latestVersion);
        hideReleaseUpdaterModal();
      });
    }

    if (releaseUpdaterActionButton) {
      releaseUpdaterActionButton.addEventListener("click", async () => {
        const latestVersion = normalizeText(releaseUpdaterState.latestVersion);
        releaseUpdaterDismissedVersion = latestVersion ? "" : releaseUpdaterDismissedVersion;
        renderReleaseUpdaterModal();
        try {
          const nextState = await bridge.startInstallUpdate();
          applyReleaseUpdaterState(nextState);
        } catch (_) {
          showToast("Unable to start the update right now.");
        }
      });
    }

    releaseUpdaterUnsubscribe = bridge.onStatusChange((payload) => {
      applyReleaseUpdaterState(payload);
    });

    Promise.resolve(bridge.getState())
      .then((payload) => {
        applyReleaseUpdaterState(payload);
      })
      .catch(() => {
        hideReleaseUpdaterModal();
      });
  }

  function confirmUserAction(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className =
        "fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4";
      overlay.innerHTML = `
        <div class="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Confirm Action</h3>
          <p class="mt-3 text-sm text-slate-700 dark:text-slate-300"></p>
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" data-confirm-cancel="1" class="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Cancel</button>
            <button type="button" data-confirm-ok="1" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Confirm</button>
          </div>
        </div>
      `;
      const messageNode = overlay.querySelector("p");
      if (messageNode) {
        messageNode.textContent = normalizeText(message);
      }

      const cleanup = (confirmed) => {
        document.removeEventListener("keydown", onKeyDown);
        overlay.remove();
        resolve(Boolean(confirmed));
      };

      const onKeyDown = (event) => {
        if (event && event.key === "Escape") {
          event.preventDefault();
          cleanup(false);
        }
      };

      const confirmButton = overlay.querySelector("[data-confirm-ok='1']");
      const cancelButton = overlay.querySelector("[data-confirm-cancel='1']");
      if (confirmButton) {
        confirmButton.addEventListener("click", () => cleanup(true), { once: true });
      }
      if (cancelButton) {
        cancelButton.addEventListener("click", () => cleanup(false), { once: true });
      }
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          cleanup(false);
        }
      });

      document.body.appendChild(overlay);
      document.addEventListener("keydown", onKeyDown);
    });
  }

  function setRecommendationExportButtonBusy(isBusy) {
    if (!recommendationExportButton) {
      return;
    }
    recommendationExportButton.disabled = !!isBusy;
    recommendationExportButton.classList.toggle("opacity-60", !!isBusy);
    recommendationExportButton.classList.toggle("cursor-not-allowed", !!isBusy);
  }

  function setScsrRecommendationExportButtonBusy(isBusy) {
    if (!scsrRecommendationExportButton) {
      return;
    }
    scsrRecommendationExportButton.disabled = !!isBusy;
    scsrRecommendationExportButton.classList.toggle("opacity-60", !!isBusy);
    scsrRecommendationExportButton.classList.toggle("cursor-not-allowed", !!isBusy);
  }

  function maybeShowDatasetOfflinePopup(error) {
    if (!isMunicipalityDatasetFetchFailure(error)) {
      return;
    }
    showDatasetOfflinePopup();
  }

  function isMunicipalityDatasetFetchFailure(error) {
    if (!error) {
      return false;
    }
    if (String(error.code || "") === "MUNICIPALITY_DATASET_FETCH_FAILED") {
      return true;
    }
    const message = String(error.message || "").toLowerCase();
    if (!message) {
      return false;
    }
    return (
      message.includes("failed to fetch sheet") &&
      !message.includes("sheet mls")
    );
  }

  function showDatasetOfflinePopup(options) {
    const resolvedTitle = normalizeText(options && options.title) || "Dataset Offline";
    const resolvedMessage =
      normalizeText(options && options.message) ||
      "Contact the developer to download your municipality datasets.";
    const modalId = "dataset-offline-modal";
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement("div");
      modal.id = modalId;
      modal.className =
        "fixed inset-0 z-[120] hidden items-center justify-center bg-black/50 p-4";
      modal.innerHTML = `
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h3 class="text-lg font-bold text-slate-900"></h3>
          <p class="mt-3 text-sm text-slate-700"></p>
          <div class="mt-5 flex justify-end">
            <button type="button" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">OK</button>
          </div>
        </div>`;
      const okButton = modal.querySelector("button");
      if (okButton) {
        okButton.addEventListener("click", () => {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
        });
      }
      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
        }
      });
      document.body.appendChild(modal);
    }
    const titleNode = modal.querySelector("h3");
    if (titleNode) {
      titleNode.textContent = resolvedTitle;
    }
    const messageNode = modal.querySelector("p");
    if (messageNode) {
      messageNode.textContent = resolvedMessage;
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  function initSummernoteIfPresent() {
    if (
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.summernote
    ) {
      return;
    }

    if (document.getElementById("summernote")) {
      window.jQuery("#summernote").summernote({
        placeholder: "Provide a detailed narrative.",
        tabsize: 2,
        tabDisable: true,
        height: 500,
        focus: true,
        toolbar: [
          ["style", ["style"]],
          ["font", ["bold", "underline", "clear"]],
          ["color", ["color"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["table", ["table"]],
          ["insert", ["link", "picture", "video"]],
          ["view", ["fullscreen", "codeview", "help"]],
        ],
        callbacks: {
          onInit: () => {
            caseDevelopmentSummernoteReady = true;
            bindSummernoteEnterAsLineBreak("#summernote");
            applySavedCaseDevelopmentDetails();
          },
          onPaste: (event) => {
            try {
              const originalEvent = event && event.originalEvent ? event.originalEvent : event;
              const clipboardData = originalEvent && originalEvent.clipboardData
                ? originalEvent.clipboardData
                : (window.clipboardData || null);
              if (!clipboardData || typeof clipboardData.getData !== "function") {
                return;
              }
              const rawHtml = String(clipboardData.getData("text/html") || "");
              const rawText = String(clipboardData.getData("text/plain") || "");
              const sanitizedHtml = sanitizeCaseDevelopmentPastedHtml(rawHtml);
              if (!sanitizedHtml && !rawText) {
                return;
              }
              if (originalEvent && typeof originalEvent.preventDefault === "function") {
                originalEvent.preventDefault();
              } else if (event && typeof event.preventDefault === "function") {
                event.preventDefault();
              }
              const currentHtml = normalizeCaseDevelopmentHtmlForStorage(
                window.jQuery("#summernote").summernote("code")
              );
              const editorIsEmpty = !normalizeText(currentHtml);
              if (sanitizedHtml) {
                if (editorIsEmpty) {
                  window.jQuery("#summernote").summernote("code", sanitizedHtml);
                } else {
                  document.execCommand("insertHTML", false, sanitizedHtml);
                }
              } else {
                document.execCommand("insertText", false, rawText);
              }
            } catch (_) {
              // Keep default paste behavior if sanitizer fails.
            }
          },
          onChange: () => {
            setCaseDevelopmentFieldError(!normalizeText(getCaseDevelopmentEditorHtml()));
            scheduleActiveNarrativeAutoSave();
            refreshExportValidationGlow();
          },
          onBlur: () => {
            if (shouldNormalizeCaseDevelopmentOnBlur(getActiveRecordWorkflowType())) {
              const normalizedOnBlur = getCaseDevelopmentEditorHtml();
              setCaseDevelopmentEditorHtml(normalizedOnBlur);
            }
            setCaseDevelopmentFieldError(!normalizeText(getCaseDevelopmentEditorHtml()));
            flushActiveNarrativeAutoSave(true);
            refreshExportValidationGlow();
          },
        },
      });
    }

    if (document.getElementById("scsr-background-summernote")) {
      window.jQuery("#scsr-background-summernote").summernote({
        placeholder: "Provide a detailed background narrative.",
        tabsize: 2,
        tabDisable: true,
        height: 500,
        focus: false,
        toolbar: [
          ["style", ["style"]],
          ["font", ["bold", "underline", "clear"]],
          ["color", ["color"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["table", ["table"]],
          ["insert", ["link", "picture", "video"]],
          ["view", ["fullscreen", "codeview", "help"]],
        ],
        callbacks: {
          onInit: () => {
            scsrBackgroundSummernoteReady = true;
            bindSummernoteEnterAsLineBreak("#scsr-background-summernote");
            renderScsrBackgroundTabs();
            applySavedScsrBackgroundDetails();
          },
          onPaste: (event) => {
            try {
              const originalEvent = event && event.originalEvent ? event.originalEvent : event;
              const clipboardData = originalEvent && originalEvent.clipboardData
                ? originalEvent.clipboardData
                : (window.clipboardData || null);
              if (!clipboardData || typeof clipboardData.getData !== "function") {
                return;
              }
              const rawHtml = String(clipboardData.getData("text/html") || "");
              const rawText = String(clipboardData.getData("text/plain") || "");
              const sanitizedHtml = sanitizeCaseDevelopmentPastedHtml(rawHtml);
              if (!sanitizedHtml && !rawText) {
                return;
              }
              if (originalEvent && typeof originalEvent.preventDefault === "function") {
                originalEvent.preventDefault();
              } else if (event && typeof event.preventDefault === "function") {
                event.preventDefault();
              }
              const currentHtml = normalizeCaseDevelopmentHtmlForStorage(
                window.jQuery("#scsr-background-summernote").summernote("code")
              );
              const editorIsEmpty = !normalizeText(currentHtml);
              if (sanitizedHtml) {
                if (editorIsEmpty) {
                  window.jQuery("#scsr-background-summernote").summernote("code", sanitizedHtml);
                } else {
                  document.execCommand("insertHTML", false, sanitizedHtml);
                }
              } else {
                document.execCommand("insertText", false, rawText);
              }
            } catch (_) {
              // Keep default paste behavior if sanitizer fails.
            }
          },
          onChange: () => {
            scheduleScsrBackgroundAutoSave();
            setScsrBackgroundFieldError(!normalizeText(getScsrBackgroundEditorHtml()));
            refreshExportValidationGlow();
          },
          onBlur: () => {
            flushScsrBackgroundAutoSave(true);
            setScsrBackgroundFieldError(!normalizeText(getScsrBackgroundEditorHtml()));
            refreshExportValidationGlow();
          },
        },
      });
    }

    if (document.getElementById("scsr-case-assessment-summernote")) {
      window.jQuery("#scsr-case-assessment-summernote").summernote({
        placeholder: "Provide a detailed case assessment narrative.",
        tabsize: 2,
        tabDisable: true,
        height: 500,
        focus: false,
        toolbar: [
          ["style", ["style"]],
          ["font", ["bold", "underline", "clear"]],
          ["color", ["color"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["table", ["table"]],
          ["insert", ["link", "picture", "video"]],
          ["view", ["fullscreen", "codeview", "help"]],
        ],
        callbacks: {
          onInit: () => {
            scsrCaseAssessmentSummernoteReady = true;
            bindSummernoteEnterAsLineBreak("#scsr-case-assessment-summernote");
            applySavedScsrCaseAssessmentDetails();
          },
          onPaste: (event) => {
            try {
              const originalEvent = event && event.originalEvent ? event.originalEvent : event;
              const clipboardData = originalEvent && originalEvent.clipboardData
                ? originalEvent.clipboardData
                : (window.clipboardData || null);
              if (!clipboardData || typeof clipboardData.getData !== "function") {
                return;
              }
              const rawHtml = String(clipboardData.getData("text/html") || "");
              const rawText = String(clipboardData.getData("text/plain") || "");
              const sanitizedHtml = sanitizeCaseDevelopmentPastedHtml(rawHtml);
              if (!sanitizedHtml && !rawText) {
                return;
              }
              if (originalEvent && typeof originalEvent.preventDefault === "function") {
                originalEvent.preventDefault();
              } else if (event && typeof event.preventDefault === "function") {
                event.preventDefault();
              }
              const currentHtml = normalizeCaseDevelopmentHtmlForStorage(
                window.jQuery("#scsr-case-assessment-summernote").summernote("code")
              );
              const editorIsEmpty = !normalizeText(currentHtml);
              if (sanitizedHtml) {
                if (editorIsEmpty) {
                  window.jQuery("#scsr-case-assessment-summernote").summernote("code", sanitizedHtml);
                } else {
                  document.execCommand("insertHTML", false, sanitizedHtml);
                }
              } else {
                document.execCommand("insertText", false, rawText);
              }
            } catch (_) {
              // Keep default paste behavior if sanitizer fails.
            }
          },
          onChange: () => {
            scheduleScsrCaseAssessmentAutoSave();
            setScsrCaseAssessmentFieldError(!normalizeText(getScsrCaseAssessmentEditorHtml()));
            refreshExportValidationGlow();
          },
          onBlur: () => {
            flushScsrCaseAssessmentAutoSave(true);
            setScsrCaseAssessmentFieldError(!normalizeText(getScsrCaseAssessmentEditorHtml()));
            refreshExportValidationGlow();
          },
        },
      });
    }

    if (document.getElementById("scsr-case-management-evaluation-summernote")) {
      window.jQuery("#scsr-case-management-evaluation-summernote").summernote({
        placeholder: "Provide a detailed case management evaluation narrative.",
        tabsize: 2,
        tabDisable: true,
        height: 500,
        focus: false,
        toolbar: [
          ["style", ["style"]],
          ["font", ["bold", "underline", "clear"]],
          ["color", ["color"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["table", ["table"]],
          ["insert", ["link", "picture", "video"]],
          ["view", ["fullscreen", "codeview", "help"]],
        ],
        callbacks: {
          onInit: () => {
            scsrCaseManagementEvaluationSummernoteReady = true;
            bindSummernoteEnterAsLineBreak("#scsr-case-management-evaluation-summernote");
            applySavedScsrCaseManagementEvaluationDetails();
          },
          onPaste: (event) => {
            try {
              const originalEvent = event && event.originalEvent ? event.originalEvent : event;
              const clipboardData = originalEvent && originalEvent.clipboardData
                ? originalEvent.clipboardData
                : (window.clipboardData || null);
              if (!clipboardData || typeof clipboardData.getData !== "function") {
                return;
              }
              const rawHtml = String(clipboardData.getData("text/html") || "");
              const rawText = String(clipboardData.getData("text/plain") || "");
              const sanitizedHtml = sanitizeCaseDevelopmentPastedHtml(rawHtml);
              if (!sanitizedHtml && !rawText) {
                return;
              }
              if (originalEvent && typeof originalEvent.preventDefault === "function") {
                originalEvent.preventDefault();
              } else if (event && typeof event.preventDefault === "function") {
                event.preventDefault();
              }
              const currentHtml = normalizeCaseDevelopmentHtmlForStorage(
                window.jQuery("#scsr-case-management-evaluation-summernote").summernote("code")
              );
              const editorIsEmpty = !normalizeText(currentHtml);
              if (sanitizedHtml) {
                if (editorIsEmpty) {
                  window.jQuery("#scsr-case-management-evaluation-summernote").summernote("code", sanitizedHtml);
                } else {
                  document.execCommand("insertHTML", false, sanitizedHtml);
                }
              } else {
                document.execCommand("insertText", false, rawText);
              }
            } catch (_) {
              // Keep default paste behavior if sanitizer fails.
            }
          },
          onChange: () => {
            scheduleScsrCaseManagementEvaluationAutoSave();
            setScsrCaseManagementEvaluationFieldError(!normalizeText(getScsrCaseManagementEvaluationEditorHtml()));
            refreshExportValidationGlow();
          },
          onBlur: () => {
            flushScsrCaseManagementEvaluationAutoSave(true);
            setScsrCaseManagementEvaluationFieldError(!normalizeText(getScsrCaseManagementEvaluationEditorHtml()));
            refreshExportValidationGlow();
          },
        },
      });
    }
  }

  function shouldNormalizeCaseDevelopmentOnBlur(workflowType) {
    const normalizedWorkflow = normalizeWorkflowType(workflowType);
    // Dedicated behavior: CSR and SCSR normalize on stepper transitions, not on blur.
    if (normalizedWorkflow === "CSR" || normalizedWorkflow === "SCSR") {
      return false;
    }
    return true;
  }

  function normalizeCsrCaseDevelopmentOnStepSwitch(previousStep, nextStep) {
    if (normalizeWorkflowType(getActiveRecordWorkflowType()) !== "CSR") {
      return;
    }
    if (previousStep !== 3 || nextStep === 3) {
      return;
    }
    const normalizedOnStepSwitch = getCaseDevelopmentEditorHtml();
    const collapsedOnStepSwitch = collapseCsrNarrativeSpacingHtml(normalizedOnStepSwitch);
    setCaseDevelopmentEditorHtml(collapsedOnStepSwitch);
  }

  function collapseCsrNarrativeSpacingHtml(value) {
    const raw = String(value || "");
    if (!raw.trim() || typeof document === "undefined") {
      return raw;
    }
    try {
      const container = document.createElement("div");
      container.innerHTML = raw;

      const isIgnorableTextNode = (node) => {
        if (!node || node.nodeType !== 3) {
          return false;
        }
        return !String(node.textContent || "").replace(/[\u00A0\s\u200B]+/g, "");
      };

      const isEmptyParagraph = (node) => {
        if (!node || node.nodeType !== 1 || String(node.tagName || "").toUpperCase() !== "P") {
          return false;
        }
        const text = String(node.textContent || "")
          .replace(/\u00A0/g, " ")
          .replace(/\u200B/g, "")
          .trim();
        return text.length === 0;
      };

      const unwrapPlainDivParagraphGroups = (root) => {
        if (!root || !root.querySelectorAll) {
          return;
        }
        Array.from(root.querySelectorAll("div")).forEach((div) => {
          if (!div || div.attributes.length > 0) {
            return;
          }
          const children = Array.from(div.childNodes || []);
          if (!children.length) {
            return;
          }
          const onlyParagraphsOrWhitespace = children.every((child) => {
            if (isIgnorableTextNode(child)) {
              return true;
            }
            return child.nodeType === 1 && String(child.tagName || "").toUpperCase() === "P";
          });
          if (!onlyParagraphsOrWhitespace) {
            return;
          }
          const fragment = document.createDocumentFragment();
          children.forEach((child) => {
            if (isIgnorableTextNode(child)) {
              return;
            }
            fragment.appendChild(child);
          });
          div.replaceWith(fragment);
        });
      };

      const mergeAdjacentParagraphs = (root) => {
        if (!root || !root.childNodes || root.childNodes.length === 0) {
          return;
        }
        Array.from(root.children || []).forEach((child) => mergeAdjacentParagraphs(child));
        let cursor = root.firstChild;
        while (cursor) {
          if (isIgnorableTextNode(cursor)) {
            const next = cursor.nextSibling;
            cursor.remove();
            cursor = next;
            continue;
          }
          if (!(cursor.nodeType === 1 && String(cursor.tagName || "").toUpperCase() === "P")) {
            cursor = cursor.nextSibling;
            continue;
          }
          if (isEmptyParagraph(cursor)) {
            const next = cursor.nextSibling;
            cursor.remove();
            cursor = next;
            continue;
          }

          let next = cursor.nextSibling;
          while (next && isIgnorableTextNode(next)) {
            const removableGap = next;
            next = next.nextSibling;
            removableGap.remove();
          }
          while (next && next.nodeType === 1 && String(next.tagName || "").toUpperCase() === "P") {
            if (isEmptyParagraph(next)) {
              const removableEmpty = next;
              next = next.nextSibling;
              removableEmpty.remove();
              while (next && isIgnorableTextNode(next)) {
                const removableGap = next;
                next = next.nextSibling;
                removableGap.remove();
              }
              continue;
            }
            cursor.appendChild(document.createElement("br"));
            while (next.firstChild) {
              cursor.appendChild(next.firstChild);
            }
            const merged = next;
            next = next.nextSibling;
            merged.remove();
            while (next && isIgnorableTextNode(next)) {
              const removableGap = next;
              next = next.nextSibling;
              removableGap.remove();
            }
          }
          cursor = next || cursor.nextSibling;
        }
      };

      const getPreviousMeaningfulSibling = (node) => {
        let cursor = node ? node.previousSibling : null;
        while (cursor) {
          if (!isIgnorableTextNode(cursor)) {
            return cursor;
          }
          const previous = cursor.previousSibling;
          cursor.remove();
          cursor = previous;
        }
        return null;
      };

      const getNextMeaningfulSibling = (node) => {
        let cursor = node ? node.nextSibling : null;
        while (cursor) {
          if (!isIgnorableTextNode(cursor)) {
            return cursor;
          }
          const next = cursor.nextSibling;
          cursor.remove();
          cursor = next;
        }
        return null;
      };

      const isBlockElementNode = (node) => {
        if (!node || node.nodeType !== 1) {
          return false;
        }
        const tag = String(node.tagName || "").toUpperCase();
        return (
          tag === "P" ||
          tag === "DIV" ||
          tag === "LI" ||
          tag === "UL" ||
          tag === "OL" ||
          tag === "TABLE" ||
          tag === "BLOCKQUOTE"
        );
      };

      const removeInterBlockBreakNodes = (root) => {
        if (!root || !root.querySelectorAll) {
          return;
        }
        Array.from(root.querySelectorAll("br")).forEach((br) => {
          const previous = getPreviousMeaningfulSibling(br);
          const next = getNextMeaningfulSibling(br);
          if (!previous || !next) {
            br.remove();
            return;
          }
          if (isBlockElementNode(previous) && isBlockElementNode(next)) {
            br.remove();
          }
        });
      };

      const compressBreakRuns = (root) => {
        if (!root || !root.childNodes || root.childNodes.length === 0) {
          return;
        }
        Array.from(root.children || []).forEach((child) => compressBreakRuns(child));

        let cursor = root.firstChild;
        while (cursor) {
          const current = cursor;
          const isBreak =
            current.nodeType === 1 && String(current.tagName || "").toUpperCase() === "BR";
          if (!isBreak) {
            cursor = current.nextSibling;
            continue;
          }

          let runTail = current;
          let next = runTail.nextSibling;
          while (next) {
            if (isIgnorableTextNode(next)) {
              const removableGap = next;
              next = next.nextSibling;
              removableGap.remove();
              continue;
            }
            const nextIsBreak =
              next.nodeType === 1 && String(next.tagName || "").toUpperCase() === "BR";
            if (!nextIsBreak) {
              break;
            }
            runTail = next;
            next = runTail.nextSibling;
          }

          while (current.nextSibling && current.nextSibling !== next) {
            current.nextSibling.remove();
          }
          cursor = next;
        }
      };

      const trimBoundaryBreaksInBlocks = (root) => {
        if (!root || !root.querySelectorAll) {
          return;
        }
        Array.from(root.querySelectorAll("p, div, li")).forEach((block) => {
          let head = block.firstChild;
          while (head) {
            if (isIgnorableTextNode(head)) {
              const next = head.nextSibling;
              head.remove();
              head = next;
              continue;
            }
            const isBreak =
              head.nodeType === 1 && String(head.tagName || "").toUpperCase() === "BR";
            if (isBreak) {
              const next = head.nextSibling;
              head.remove();
              head = next;
              continue;
            }
            break;
          }

          let tail = block.lastChild;
          while (tail) {
            if (isIgnorableTextNode(tail)) {
              const previous = tail.previousSibling;
              tail.remove();
              tail = previous;
              continue;
            }
            const isBreak =
              tail.nodeType === 1 && String(tail.tagName || "").toUpperCase() === "BR";
            if (isBreak) {
              const previous = tail.previousSibling;
              tail.remove();
              tail = previous;
              continue;
            }
            break;
          }
        });
      };

      unwrapPlainDivParagraphGroups(container);
      removeInterBlockBreakNodes(container);
      compressBreakRuns(container);
      trimBoundaryBreaksInBlocks(container);
      return String(container.innerHTML || "").trim();
    } catch (_) {
      return raw;
    }
  }

  function bindSummernoteEnterAsLineBreak(editorSelector) {
    if (
      !editorSelector ||
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn
    ) {
      return;
    }
    const host = window.jQuery(editorSelector);
    if (!host.length) {
      return;
    }
    const editable = host.next(".note-editor").find(".note-editable");
    if (!editable.length) {
      return;
    }
    editable.off("keydown.csrEnterLineBreak");
    editable.on("keydown.csrEnterLineBreak", (event) => {
      if (!event || String(event.key || "") !== "Enter") {
        return;
      }
      if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const selection = typeof window.getSelection === "function" ? window.getSelection() : null;
      const anchorNode = selection && selection.anchorNode ? selection.anchorNode : event.target;
      const contextNode =
        anchorNode && anchorNode.nodeType === 1 ? anchorNode : anchorNode && anchorNode.parentNode;
      if (contextNode && typeof contextNode.closest === "function") {
        if (contextNode.closest("li, td, th, blockquote")) {
          return;
        }
      }
      event.preventDefault();
      try {
        if (typeof document.execCommand === "function") {
          document.execCommand("insertHTML", false, "<br>");
        }
      } catch (_) {
        try {
          if (typeof document.execCommand === "function") {
            document.execCommand("insertHTML", false, "<br>");
          }
        } catch (_) {
          // Keep editor usable if line-break insertion fails.
        }
      }
    });
  }

  function bindStepperEvents() {
    if (!csrStepper) {
      return;
    }
    csrStepper.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-step-trigger]");
      if (!trigger || !csrStepper.contains(trigger)) {
        return;
      }
      const step = Number(trigger.dataset.stepTrigger);
      const maxSteps = getCurrentWorkflowStepCount();
      if (!Number.isInteger(step) || step < 1 || step > maxSteps) {
        return;
      }
      setActiveCsrStep(step);
    });
  }

  function refreshStepperTriggers() {
    stepTriggers = csrStepper
      ? Array.from(csrStepper.querySelectorAll("[data-step-trigger]"))
      : [];
  }

  function normalizeWorkflowType(value) {
    return String(value || "").trim().toUpperCase() === "SCSR" ? "SCSR" : "CSR";
  }

  function getDatasetKindFromWorkflowType(workflowType) {
    return normalizeWorkflowType(workflowType) === "SCSR" ? "scsr" : "csr";
  }

  function getActiveDatasetKind() {
    return getDatasetKindFromWorkflowType(activeWorkflowType);
  }

  function setBasicInfoFieldRequired(fieldId, isRequired) {
    const field = document.getElementById(fieldId);
    if (!field) {
      return;
    }
    if (isRequired) {
      field.setAttribute("data-basic-edit-required", "1");
    } else {
      field.removeAttribute("data-basic-edit-required");
      clearBasicInfoFieldError(field);
    }
  }

  function setPrevWellBeingDatalistOptions(options) {
    const datalist = document.getElementById(PREV_WELLBEING_DATALIST_ID);
    if (!datalist) {
      return;
    }
    datalist.innerHTML = (Array.isArray(options) ? options : [])
      .map((value) => `<option value="${escapeHtml(value)}"></option>`)
      .join("");
  }

  function applyBasicInfoFormMode() {
    const isScsr = getActiveRecordWorkflowType() === "SCSR";

    if (basicInfoSectionTitle) {
      basicInfoSectionTitle.textContent = isScsr ? "Identifying Information" : "Beneficiary Profile";
    }
    if (basicGranteeNameLabel) {
      basicGranteeNameLabel.textContent = isScsr ? "Client's Name" : "Grantee Name";
    }
    if (basicSourceOfInfoLabel) {
      basicSourceOfInfoLabel.textContent = isScsr ? "Source of Income" : "Source of Info";
    }
    if (basicPrevWellBeingLabel) {
      basicPrevWellBeingLabel.textContent = isScsr
        ? "Level of Well-Being"
        : "Current Level of Well-being";
    }

    if (nationalIdFieldWrap) {
      nationalIdFieldWrap.classList.toggle("hidden", isScsr);
    }
    if (yearRegistrationFieldWrap) {
      yearRegistrationFieldWrap.classList.toggle("hidden", isScsr);
    }
    if (yearsProgramFieldWrap) {
      yearsProgramFieldWrap.classList.toggle("hidden", isScsr);
    }
    if (scsrIncomeFieldsWrap) {
      scsrIncomeFieldsWrap.classList.toggle("hidden", !isScsr);
    }
    applyPerCapitaIncomeFieldMode(isScsr);

    if (isScsr) {
      setFieldValue("edit-national-id", "");
      setFieldValue("edit-year-registration", "");
      setFieldValue("edit-years-program", "");
      setFieldValue("edit-source-of-info", "");
      const prevWellBeingField = document.getElementById("edit-prev-wellbeing");
      if (prevWellBeingField) {
        prevWellBeingField.placeholder = "e.g. Level 2 - Subsistence";
        if (document.getElementById(PREV_WELLBEING_DATALIST_ID)) {
          prevWellBeingField.setAttribute("list", PREV_WELLBEING_DATALIST_ID);
        }
      }
      setPrevWellBeingDatalistOptions(SCSR_PREV_WELLBEING_OPTIONS);
      const sourceOfIncomeField = document.getElementById(SOURCE_OF_INFO_FIELD_ID);
      if (sourceOfIncomeField) {
        sourceOfIncomeField.placeholder = "e.g. Food Vendor";
        sourceOfIncomeField.removeAttribute("list");
        sourceOfIncomeField.setAttribute("autocomplete", "off");
      }
      setBasicInfoFieldRequired("edit-national-id", false);
      setBasicInfoFieldRequired("edit-year-registration", false);
      setBasicInfoFieldRequired("edit-years-program", false);
    } else {
      const prevWellBeingField = document.getElementById("edit-prev-wellbeing");
      if (prevWellBeingField) {
        prevWellBeingField.placeholder = "Level 2 - Subsistence Index Score : 2.52484";
        if (document.getElementById(PREV_WELLBEING_DATALIST_ID)) {
          prevWellBeingField.setAttribute("list", PREV_WELLBEING_DATALIST_ID);
        }
      }
      setPrevWellBeingDatalistOptions(CSR_PREV_WELLBEING_OPTIONS);
      const sourceOfInfoField = document.getElementById(SOURCE_OF_INFO_FIELD_ID);
      if (sourceOfInfoField) {
        sourceOfInfoField.placeholder = "e.g. Grantee";
        if (document.getElementById(SOURCE_OF_INFO_DATALIST_ID)) {
          sourceOfInfoField.setAttribute("list", SOURCE_OF_INFO_DATALIST_ID);
        }
        sourceOfInfoField.removeAttribute("autocomplete");
      }
      setBasicInfoFieldRequired("edit-national-id", true);
      setBasicInfoFieldRequired("edit-year-registration", true);
      setBasicInfoFieldRequired("edit-years-program", true);
    }
    syncScsrPerCapitaIncomeField();
  }

  function getCurrentWorkflowStepCount() {
    return activeWorkflowType === "SCSR" ? SCSR_STEP_COUNT : CSR_STEP_COUNT;
  }

  function getCurrentWorkflowStepTitles() {
    return activeWorkflowType === "SCSR"
      ? SCSR_STEP_TITLES
      : CSR_STEP_TITLES;
  }

  function getNarrativeRecordKeyForWorkflow(workflowType) {
    return normalizeWorkflowType(workflowType) === "SCSR"
      ? "presentingProblem"
      : "caseDevelopment";
  }

  function getCurrentNarrativeRecordKey() {
    return getNarrativeRecordKeyForWorkflow(
      (currentCsrRecord && currentCsrRecord.workflowType) || activeWorkflowType
    );
  }

  function getNarrativeSectionLabelForWorkflow(workflowType) {
    return normalizeWorkflowType(workflowType) === "SCSR"
      ? "Presenting Problem"
      : "Case Development";
  }

  function getCurrentNarrativeSectionLabel() {
    return getNarrativeSectionLabelForWorkflow(
      (currentCsrRecord && currentCsrRecord.workflowType) || activeWorkflowType
    );
  }

  function isValidScsrBackgroundTabKey(tabKey) {
    return SCSR_BACKGROUND_TABS.some((item) => item.key === normalizeText(tabKey));
  }

  function getScsrBackgroundRecordStore() {
    const store =
      currentCsrRecord &&
      currentCsrRecord.backgroundInformation &&
      typeof currentCsrRecord.backgroundInformation === "object"
        ? currentCsrRecord.backgroundInformation
        : null;
    return store || {};
  }

  function getScsrBackgroundActiveTabFromStore() {
    const preferred = normalizeText(getScsrBackgroundRecordStore().activeTab);
    if (isValidScsrBackgroundTabKey(preferred)) {
      return preferred;
    }
    return SCSR_BACKGROUND_TABS[0].key;
  }

  function getScsrBackgroundTabsStore() {
    const tabs = getScsrBackgroundRecordStore().tabs;
    return tabs && typeof tabs === "object" ? tabs : {};
  }

  function getScsrBackgroundTabEntry(tabKey) {
    const safeTabKey = isValidScsrBackgroundTabKey(tabKey)
      ? normalizeText(tabKey)
      : SCSR_BACKGROUND_TABS[0].key;
    const tabs = getScsrBackgroundTabsStore();
    const entry = tabs[safeTabKey];
    return entry && typeof entry === "object" ? entry : {};
  }

  function normalizeScsrBackgroundTabsStoreInMemory() {
    if (
      !currentCsrRecord ||
      !currentCsrRecord.backgroundInformation ||
      typeof currentCsrRecord.backgroundInformation !== "object"
    ) {
      return;
    }
    const existingTabs =
      currentCsrRecord.backgroundInformation.tabs &&
      typeof currentCsrRecord.backgroundInformation.tabs === "object"
        ? currentCsrRecord.backgroundInformation.tabs
        : {};
    let changed = false;
    const nextTabs = { ...existingTabs };
    SCSR_BACKGROUND_TABS.forEach((item) => {
      const entry = existingTabs[item.key];
      if (!entry || typeof entry !== "object") {
        return;
      }
      const normalizedHtml = normalizeCaseDevelopmentHtmlForStorage(entry.html);
      if (normalizedHtml !== String(entry.html || "")) {
        nextTabs[item.key] = {
          ...entry,
          html: normalizedHtml,
        };
        changed = true;
      }
    });
    if (changed) {
      currentCsrRecord.backgroundInformation = {
        ...currentCsrRecord.backgroundInformation,
        tabs: nextTabs,
      };
    }
  }

  function renderScsrBackgroundTabs() {
    if (!scsrBackgroundTabList) {
      return;
    }
    scsrBackgroundTabList.innerHTML = SCSR_BACKGROUND_TABS.map((item) => {
      const isActive = item.key === activeScsrBackgroundTabKey;
      const isInvalid = scsrBackgroundInvalidTabKeys.has(item.key);
      const activeClasses = isActive
        ? "bg-primary text-white border-primary"
        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600";
      const invalidClasses = isInvalid
        ? " ring-1 ring-red-500 border-red-500 text-red-600 dark:text-red-300"
        : "";
      return `<button type="button" data-scsr-background-tab="${escapeHtml(item.key)}" class="px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${activeClasses}${invalidClasses}">${escapeHtml(item.label)}</button>`;
    }).join("");
  }

  function renderWorkflowStepper() {
    const stepTitles = getCurrentWorkflowStepTitles();
    if (csrStepperMobile) {
      csrStepperMobile.innerHTML = stepTitles
        .map((title, index) => {
          const step = index + 1;
          return `<button type="button" data-step-trigger="${step}" class="flex items-center gap-3 px-3 py-2">
            <div class="flex items-center justify-center w-8 h-8 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-full font-medium">${step}</div>
            <span class="text-sm font-medium text-slate-500 dark:text-slate-400">${escapeHtml(title)}</span>
          </button>`;
        })
        .join("");
    }

    if (csrStepperDesktop) {
      let desktopMarkup = "";
      stepTitles.forEach((title, index) => {
        const step = index + 1;
        desktopMarkup += `<button type="button" data-step-trigger="${step}" class="flex flex-col items-center w-[120px] text-center bg-transparent border-0 p-0">
            <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 font-semibold text-sm">${step}</div>
            <span class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">${escapeHtml(title)}</span>
          </button>`;
        if (step < stepTitles.length) {
          desktopMarkup += '<div class="h-[2px] w-14 bg-slate-300 dark:bg-slate-600 rounded-full"></div>';
        }
      });
      csrStepperDesktop.innerHTML = desktopMarkup;
    }

    applyWorkflowStepperResponsiveMode();
    refreshStepperTriggers();
  }

  function applyWorkflowStepperResponsiveMode() {
    if (csrStepperMobile) {
      csrStepperMobile.classList.remove("lg:hidden", "xl:hidden");
      if (activeWorkflowType === "SCSR") {
        csrStepperMobile.classList.add("xl:hidden");
      } else {
        csrStepperMobile.classList.add("lg:hidden");
      }
    }
    if (csrStepperDesktopWrap) {
      csrStepperDesktopWrap.classList.remove("hidden", "lg:block", "xl:block");
      csrStepperDesktopWrap.classList.add("hidden");
      if (activeWorkflowType === "SCSR") {
        csrStepperDesktopWrap.classList.add("xl:block");
      } else {
        csrStepperDesktopWrap.classList.add("lg:block");
      }
    }
  }

  function setWorkflowType(type) {
    const normalized = normalizeWorkflowType(type);
    activeWorkflowType = normalized;
    renderWorkflowStepper();
    applyBasicInfoFormMode();
    renderScsrBackgroundTabs();
    if (activeWorkflowType !== "CSR") {
      exportValidationArmed = false;
      exportInvalidSteps = new Set();
    }
  }

  function openWorkflowTypeModal(cardData) {
    if (!workflowTypeModal) {
      void openWorkflowForCard(cardData, "CSR");
      return;
    }
    pendingWorkflowCardData = cardData && typeof cardData === "object"
      ? { ...cardData }
      : null;
    workflowTypeModal.classList.remove("hidden");
    workflowTypeModal.classList.add("flex");
  }

  function closeWorkflowTypeModal() {
    if (!workflowTypeModal) {
      pendingWorkflowCardData = null;
      return;
    }
    workflowTypeModal.classList.add("hidden");
    workflowTypeModal.classList.remove("flex");
    pendingWorkflowCardData = null;
  }

  function setWorkflowTypeModalButtonsDisabled(isDisabled) {
    if (workflowTypeCsrButton) {
      workflowTypeCsrButton.disabled = !!isDisabled;
      workflowTypeCsrButton.classList.toggle("opacity-60", !!isDisabled);
      workflowTypeCsrButton.classList.toggle("cursor-not-allowed", !!isDisabled);
    }
    if (workflowTypeScsrButton) {
      workflowTypeScsrButton.disabled = !!isDisabled;
      workflowTypeScsrButton.classList.toggle("opacity-60", !!isDisabled);
      workflowTypeScsrButton.classList.toggle("cursor-not-allowed", !!isDisabled);
    }
  }

  async function handleWorkflowTypeSelection(type) {
    if (!pendingWorkflowCardData) {
      closeWorkflowTypeModal();
      return;
    }
    const cardData = { ...pendingWorkflowCardData };
    setWorkflowTypeModalButtonsDisabled(true);
    try {
      await openWorkflowForCard(cardData, type);
      closeWorkflowTypeModal();
    } catch (error) {
      console.error("Open workflow failed:", error);
      showToast("Unable to open workflow. Please try again.");
    } finally {
      setWorkflowTypeModalButtonsDisabled(false);
    }
  }

  async function handleHouseholdGridClick(event) {
    const button = event.target.closest(".create-csr-btn");
    if (!button) {
      return;
    }
    const cardData = {
      name: normalizeText(button.getAttribute("data-name")),
      hhid: normalizeText(button.getAttribute("data-hhid")),
      municipality: normalizeText(button.getAttribute("data-municipality")),
      barangay: normalizeText(button.getAttribute("data-barangay")),
    };
    openWorkflowTypeModal(cardData);
  }

  async function openWorkflowForCard(cardData, type) {
    const selectedType = normalizeWorkflowType(type);
    if (currentCsrRecord && currentCsrRecord.csrId) {
      flushAllAutoSaveQueues();
    }
    setWorkflowType(selectedType);
    const datasetKind = getActiveDatasetKind();
    const municipality = normalizeText(cardData && cardData.municipality).toUpperCase();
    try {
      await cleanupWorkflowIsolationForMunicipality(municipality, selectedType);
      const existingRecord = await getExistingCsrRecordForCardSafe(cardData, selectedType);
      if (existingRecord) {
        const promptKey =
          buildHouseholdKey(cardData) || String(existingRecord.csrId || "");
        const shouldShowInfo = !!promptKey && !csrOpenConfirmShownKeys.has(promptKey);
        if (shouldShowInfo) {
          const completionState = getCsrCompletionState(existingRecord);
          if (completionState.isCompleted) {
            const completedOnLabel = formatCompletionDateLabel(completionState.completedAt);
            showToast(
              completedOnLabel
                ? `Completed ${selectedType} already exists (completed on ${completedOnLabel}). Opening existing record.`
                : `Completed ${selectedType} already exists. Opening existing record.`,
              "pending",
              6000
            );
          }
          csrOpenConfirmShownKeys.add(promptKey);
        }
      }
      await ensureMunicipalityDbFile(
        municipality,
        datasetKind
      );
      const result = await createOrGetCsrRecord(cardData, selectedType);
      let recordToOpen = result.record;
      if (!result.isNew && result.record && result.record.csrId) {
        try {
          const refreshedRecord = await getCsrRecordById(
            result.record.csrId,
            municipality,
            selectedType
          );
          if (refreshedRecord) {
            recordToOpen = refreshedRecord;
          }
        } catch (_) {
          // Keep original open flow if refresh-by-id fails.
        }
      }
      recordToOpen = await hydrateRecordFromCounterpartWorkflow(recordToOpen);
      currentCsrRecord = recordToOpen;
      applySavedBasicInfoEditDetails();
      applySavedCaseDevelopmentDetails();
      applySavedScsrBackgroundDetails();
      applySavedScsrCaseAssessmentDetails();
      applySavedScsrPlanImplementationDetails();
      applySavedScsrCaseManagementEvaluationDetails();
      applySavedScsrRecommendationDetails();
      applySavedInterventionsProvidedDetails();
      applySavedHouseholdInterventionPlanDetails();
      applySavedRecommendationDetails();
      showCsrWorkspace();
      setActiveCsrStep(1);
      void populateBasicInfoFromSelectedCard(
        recordToOpen && recordToOpen.cardData,
        recordToOpen && recordToOpen.csrId
      );
      if (selectedType === "CSR") {
        void populateFamilyCompositionFromSelectedCard(
          recordToOpen && recordToOpen.cardData
        );
      }
      setCsrViewState({
        mode: "workspace",
        csrId: String(recordToOpen.csrId || ""),
        workflowType: selectedType,
        activeStep: 1,
      });
      showToast(
        result.isNew
          ? `${selectedType} ${recordToOpen.csrId} created.`
          : `${selectedType} ${recordToOpen.csrId} opened.`,
        "success",
        3000
      );
    } catch (error) {
      console.error("Open workflow failed:", error);
      showToast("Unable to open workflow. Please try again.");
    }
  }

  function showCsrWorkspace() {
    if (dataTableCard) {
      dataTableCard.classList.add("hidden");
    }
    if (csrStepper) {
      csrStepper.classList.remove("hidden");
    }
    if (returnToSelectionButton) {
      returnToSelectionButton.classList.remove("hidden");
      returnToSelectionButton.classList.add("inline-flex");
    }
  }

  function hideCsrWorkspace() {
    flushBasicInfoAutoSave();
    flushFamilyCompositionAutoSave();
    flushActiveNarrativeAutoSave(true);
    flushScsrBackgroundAutoSave(true);
    flushScsrCaseAssessmentAutoSave(true);
    flushScsrCaseManagementEvaluationAutoSave(true);
    flushScsrPlanImplementationDraftAutoSave(true);
    flushScsrPlanImplementationAutoSave(true);
    flushScsrRecommendationAutoSave(true);
    flushInterventionsProvidedDraftAutoSave(true);
    flushInterventionsProvidedAutoSave(true);
    flushHouseholdInterventionPlanDraftAutoSave(true);
    flushHouseholdInterventionPlanAutoSave(true);
    flushRecommendationAutoSave(true);
    closeFamilyCompositionRestoreModal();
    closeScsrPlanImplementationModal();
    closeInterventionsProvidedModal();
    closeHouseholdInterventionPlanModal();
    renderScsrPlanImplementationRows([]);
    renderInterventionsProvidedRows([]);
    renderHouseholdInterventionPlanRows([]);
    latestFamilyCompositionRows = [];
    setFamilyCompositionSaveStatus("", "neutral");
    setCaseDevelopmentSaveStatus("", "neutral");
    setScsrBackgroundSaveStatus("", "neutral");
    setScsrCaseAssessmentSaveStatus("", "neutral");
    setScsrCaseManagementEvaluationSaveStatus("", "neutral");
    setScsrPlanImplementationSaveStatus("", "neutral");
    setScsrRecommendationSaveStatus("", "neutral");
    setInterventionsProvidedSaveStatus("", "neutral");
    setHouseholdInterventionPlanSaveStatus("", "neutral");
    setRecommendationSaveStatus("", "neutral");
    clearModalFieldError(recommendationTextField);
    clearModalFieldError(scsrRecommendationTextField);
    exportValidationArmed = false;
    setExportInvalidSteps([]);
    if (csrStepper) {
      csrStepper.classList.add("hidden");
    }
    stepSections.forEach((section) => {
      section.classList.add("hidden");
    });
    if (returnToSelectionButton) {
      returnToSelectionButton.classList.add("hidden");
      returnToSelectionButton.classList.remove("inline-flex");
    }
    currentCsrRecord = null;
    activeCsrStep = 1;
  }

  function setActiveCsrStep(step) {
    const maxSteps = getCurrentWorkflowStepCount();
    if (!Number.isInteger(step) || step < 1 || step > maxSteps) {
      return;
    }
    const previousStep = activeCsrStep;
    if (previousStep !== step) {
      normalizeActiveNarrativeEditorForStep(previousStep, activeWorkflowType);
      normalizeCsrCaseDevelopmentOnStepSwitch(previousStep, step);
    }
    if (activeWorkflowType === "CSR") {
      if (previousStep === 1 && step !== 1) {
        flushBasicInfoAutoSave();
      }
      if (previousStep === 2 && step !== 2) {
        flushFamilyCompositionAutoSave();
      }
      if (previousStep === 4 && step !== 4) {
        flushInterventionsProvidedDraftAutoSave(true);
        flushInterventionsProvidedAutoSave(true);
      }
      if (previousStep === 5 && step !== 5) {
        flushHouseholdInterventionPlanDraftAutoSave(true);
        flushHouseholdInterventionPlanAutoSave(true);
      }
      if (previousStep === 6 && step !== 6) {
        flushRecommendationAutoSave(true);
      }
    } else if (activeWorkflowType === "SCSR") {
      if (previousStep === 2 && step !== 2) {
        flushFamilyCompositionAutoSave();
      }
      if (previousStep === 4 && step !== 4) {
        flushScsrBackgroundAutoSave(true);
      }
      if (previousStep === 5 && step !== 5) {
        flushScsrCaseAssessmentAutoSave(true);
      }
      if (previousStep === 6 && step !== 6) {
        flushScsrPlanImplementationDraftAutoSave(true);
        flushScsrPlanImplementationAutoSave(true);
      }
      if (previousStep === 7 && step !== 7) {
        flushScsrCaseManagementEvaluationAutoSave(true);
      }
      if (previousStep === 8 && step !== 8) {
        flushScsrRecommendationAutoSave(true);
      }
    }
    if (previousStep === 3 && step !== 3) {
      flushActiveNarrativeAutoSave(true);
    }
    activeCsrStep = step;

    if (activeWorkflowType === "CSR") {
      stepSections.forEach((section) => {
        const sectionStep = Number(section.dataset.stepSection);
        const sectionWorkflow = normalizeText(section.dataset.workflow).toUpperCase();
        const isOtherWorkflow = sectionWorkflow && sectionWorkflow !== "CSR";
        section.classList.toggle("hidden", sectionStep !== step || isOtherWorkflow);
      });
    } else {
      stepSections.forEach((section) => {
        const sectionStep = Number(section.dataset.stepSection);
        const sectionWorkflow = normalizeText(section.dataset.workflow).toUpperCase();
        const isOtherWorkflow = sectionWorkflow && sectionWorkflow !== "SCSR";
        const shouldShow =
          (step === 1 && sectionStep === 1) ||
          (step === 2 && sectionStep === 2) ||
          (step === 3 && sectionStep === 3) ||
          (step === 4 && sectionStep === 4) ||
          (step === 5 && sectionStep === 5) ||
          (step === 6 && sectionStep === 6) ||
          (step === 7 && sectionStep === 7) ||
          (step === 8 && sectionStep === 8);
        section.classList.toggle("hidden", !shouldShow || isOtherWorkflow);
      });
    }

    stepTriggers.forEach((trigger) => {
      const triggerStep = Number(trigger.dataset.stepTrigger);
      const isActive = triggerStep === step;
      const circle = trigger.querySelector("div");
      const label = trigger.querySelector("span");

      trigger.setAttribute("aria-current", isActive ? "step" : "false");
      if (!circle || !label) {
        return;
      }

      circle.classList.toggle("bg-primary", isActive);
      circle.classList.toggle("text-white", isActive);
      circle.classList.toggle("shadow-lg", isActive);
      circle.classList.toggle("ring-4", isActive);
      circle.classList.toggle("ring-primary/20", isActive);
      circle.classList.toggle("font-bold", isActive);

      circle.classList.toggle("bg-white", !isActive);
      circle.classList.toggle("dark:bg-slate-800", !isActive);
      circle.classList.toggle("border-2", !isActive);
      circle.classList.toggle("border-slate-300", !isActive);
      circle.classList.toggle("dark:border-slate-600", !isActive);
      circle.classList.toggle("text-slate-500", !isActive);
      circle.classList.toggle("dark:text-slate-400", !isActive);
      circle.classList.toggle("font-medium", !isActive);

      label.classList.toggle("font-bold", isActive);
      label.classList.toggle("text-primary", isActive);
      label.classList.toggle("font-medium", !isActive);
      label.classList.toggle("text-slate-500", !isActive);
      label.classList.toggle("dark:text-slate-400", !isActive);
    });
    applyExportValidationGlow();

    if (currentCsrRecord) {
      currentCsrRecord.activeStep = step;
      void persistCsrRecord(currentCsrRecord);
      setCsrViewState({
        mode: "workspace",
        csrId: String(currentCsrRecord.csrId || ""),
        workflowType: normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType),
        activeStep: step,
      });
    }
    if (currentCsrRecord) {
      if (step === 2) {
        void populateFamilyCompositionFromSelectedCard(currentCsrRecord.cardData);
      }
    }
    if (currentCsrRecord && step === 3 && previousStep !== 3) {
      applySavedCaseDevelopmentDetails();
    }
    if (currentCsrRecord && activeWorkflowType === "SCSR" && step === 4) {
      applySavedScsrBackgroundDetails();
    }
    if (currentCsrRecord && activeWorkflowType === "SCSR" && step === 5) {
      applySavedScsrCaseAssessmentDetails();
    }
    if (currentCsrRecord && activeWorkflowType === "SCSR" && step === 6) {
      applySavedScsrPlanImplementationDetails();
    }
    if (currentCsrRecord && activeWorkflowType === "SCSR" && step === 7) {
      applySavedScsrCaseManagementEvaluationDetails();
    }
    if (currentCsrRecord && activeWorkflowType === "SCSR" && step === 8) {
      applySavedScsrRecommendationDetails();
    }
    if (currentCsrRecord && activeWorkflowType === "CSR") {
      if (step === 6) {
        applySavedRecommendationDetails();
      }
    }
  }

  function setExportInvalidSteps(stepNumbers) {
    const maxSteps = getCurrentWorkflowStepCount();
    exportInvalidSteps = new Set(
      (Array.isArray(stepNumbers) ? stepNumbers : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= maxSteps)
    );
    applyExportValidationGlow();
  }

  function applyExportValidationGlow() {
    stepTriggers.forEach((trigger) => {
      const triggerStep = Number(trigger.dataset.stepTrigger);
      const isInvalid = exportInvalidSteps.has(triggerStep);
      const isActive = triggerStep === activeCsrStep;
      const circle = trigger.querySelector("div");
      const label = trigger.querySelector("span");
      if (!circle || !label) {
        return;
      }
      if (isInvalid) {
        circle.classList.add(
          "bg-red-50",
          "dark:bg-red-900/20",
          "border-red-500",
          "text-red-600",
          "dark:text-red-300",
          "ring-4",
          "ring-red-300/70",
          "dark:ring-red-800/60",
          "shadow-lg"
        );
        circle.classList.remove(
          "bg-primary",
          "text-white",
          "ring-primary/20",
          "bg-white",
          "dark:bg-slate-800",
          "border-slate-300",
          "dark:border-slate-600",
          "text-slate-500",
          "dark:text-slate-400"
        );
        label.classList.add("text-red-600", "dark:text-red-400", "font-bold");
        label.classList.remove("text-primary", "text-slate-500", "dark:text-slate-400");
        return;
      }
      circle.classList.remove(
        "bg-red-50",
        "dark:bg-red-900/20",
        "border-red-500",
        "text-red-600",
        "dark:text-red-300",
        "ring-red-300/70",
        "dark:ring-red-800/60",
        "shadow-lg"
      );
      label.classList.remove("text-red-600", "dark:text-red-400");
      if (isActive) {
        circle.classList.remove("font-medium");
        circle.classList.add("bg-primary", "text-white", "ring-4", "ring-primary/20", "font-bold");
        label.classList.remove("font-medium");
        label.classList.add("font-bold", "text-primary");
      } else {
        circle.classList.remove("font-bold");
        circle.classList.add(
          "bg-white",
          "dark:bg-slate-800",
          "border-2",
          "border-slate-300",
          "dark:border-slate-600",
          "text-slate-500",
          "dark:text-slate-400",
          "font-medium"
        );
        label.classList.remove("font-bold", "text-primary");
        label.classList.add("font-medium", "text-slate-500", "dark:text-slate-400");
      }
    });
  }

  function setCaseDevelopmentFieldError(hasError) {
    const editor = document.querySelector("#casedevelopment .note-editor");
    if (!editor) {
      return;
    }
    editor.classList.toggle("border-red-500", Boolean(hasError));
    editor.classList.toggle("ring-1", Boolean(hasError));
    editor.classList.toggle("ring-red-500", Boolean(hasError));
  }

  function setScsrBackgroundFieldError(hasError) {
    const editor = document.querySelector("#scsr-background-information-section .note-editor");
    if (!editor) {
      return;
    }
    editor.classList.toggle("border-red-500", Boolean(hasError));
    editor.classList.toggle("ring-1", Boolean(hasError));
    editor.classList.toggle("ring-red-500", Boolean(hasError));
  }

  function setScsrCaseAssessmentFieldError(hasError) {
    const editor = document.querySelector("#scsr-case-assessment-section .note-editor");
    if (!editor) {
      return;
    }
    editor.classList.toggle("border-red-500", Boolean(hasError));
    editor.classList.toggle("ring-1", Boolean(hasError));
    editor.classList.toggle("ring-red-500", Boolean(hasError));
  }

  function setScsrCaseManagementEvaluationFieldError(hasError) {
    const editor = document.querySelector("#scsr-case-management-evaluation-section .note-editor");
    if (!editor) {
      return;
    }
    editor.classList.toggle("border-red-500", Boolean(hasError));
    editor.classList.toggle("ring-1", Boolean(hasError));
    editor.classList.toggle("ring-red-500", Boolean(hasError));
  }

  function collectScsrBackgroundValidation(options) {
    const config = {
      markFields: false,
      ...options,
    };
    const tabsStore = getScsrBackgroundTabsStore();
    const tabHtmlByKey = {};
    SCSR_BACKGROUND_TABS.forEach((item) => {
      tabHtmlByKey[item.key] = normalizeCaseDevelopmentHtmlForStorage(
        tabsStore[item.key] && tabsStore[item.key].html
      );
    });

    if (isValidScsrBackgroundTabKey(activeScsrBackgroundTabKey) && scsrBackgroundSummernoteReady) {
      tabHtmlByKey[activeScsrBackgroundTabKey] = normalizeCaseDevelopmentHtmlForStorage(
        getScsrBackgroundEditorHtml()
      );
    }

    const missingTabKeys = SCSR_BACKGROUND_TABS
      .map((item) => item.key)
      .filter((key) => !normalizeText(tabHtmlByKey[key]));

    scsrBackgroundInvalidTabKeys = new Set(missingTabKeys);
    renderScsrBackgroundTabs();

    if (config.markFields) {
      setScsrBackgroundFieldError(scsrBackgroundInvalidTabKeys.has(activeScsrBackgroundTabKey));
    }

    return {
      valid: missingTabKeys.length === 0,
      missingTabKeys,
    };
  }

  function collectCsrBasicInfoStepValidation(options) {
    const config = {
      markFields: false,
      ...options,
    };
    const requiredFieldIds = new Set(getBasicInfoRequiredFieldIds("CSR"));
    const basicFields = getBasicInfoRequiredFields("CSR");
    let hasInvalidField = false;

    basicFields.forEach((field) => {
      const invalid = isBasicInfoFieldEmpty(field);
      if (config.markFields) {
        if (invalid) {
          setBasicInfoFieldError(field);
        } else {
          clearBasicInfoFieldError(field);
        }
      }
      if (invalid) {
        hasInvalidField = true;
      }
    });

    if (basicSexInput) {
      const sexInvalid = !normalizeText(basicSexInput.value);
      if (sexInvalid) {
        hasInvalidField = true;
        if (config.markFields) {
          setBasicInfoFieldError(basicSexInput);
        }
      } else if (config.markFields) {
        clearBasicInfoFieldError(basicSexInput);
      }
    }

    if (basicCivilStatusInput) {
      const civilStatusInvalid = !normalizeText(basicCivilStatusInput.value);
      if (civilStatusInvalid) {
        hasInvalidField = true;
        if (config.markFields) {
          setBasicInfoFieldError(basicCivilStatusInput);
        }
      } else if (config.markFields) {
        clearBasicInfoFieldError(basicCivilStatusInput);
      }
    }

    if (basicGranteeNameInput) {
      const nameInvalid =
        !normalizeText(basicGranteeNameInput.value) ||
        hasNumericCharacters(basicGranteeNameInput.value);
      if (nameInvalid) {
        hasInvalidField = true;
        if (config.markFields) {
          setBasicInfoFieldError(basicGranteeNameInput);
        }
      } else if (config.markFields) {
        clearBasicInfoFieldError(basicGranteeNameInput);
      }
    }

    const yearsField = document.getElementById("edit-years-program");
    const yearsInProgram = getFieldValue("edit-years-program");
    if (requiredFieldIds.has("edit-years-program") && yearsField) {
      if (!/^\d{1,2}$/.test(yearsInProgram || "")) {
        hasInvalidField = true;
        if (config.markFields) {
          setBasicInfoFieldError(yearsField);
        }
      } else if (config.markFields) {
        clearBasicInfoFieldError(yearsField);
      }
    }

    const contactInfoField = document.getElementById("edit-contact-info");
    if (requiredFieldIds.has("edit-contact-info") && contactInfoField) {
      const contactInfoInvalid = isContactInfoValueInvalid(contactInfoField.value);
      if (contactInfoInvalid) {
        hasInvalidField = true;
        if (config.markFields) {
          setBasicInfoFieldError(contactInfoField);
        }
      } else if (config.markFields) {
        clearBasicInfoFieldError(contactInfoField);
      }
    }

    const nationalIdField = document.getElementById("edit-national-id");
    if (requiredFieldIds.has("edit-national-id") && nationalIdField) {
      const nationalIdInvalid = isNationalIdValueInvalid(nationalIdField.value);
      if (nationalIdInvalid) {
        hasInvalidField = true;
        if (config.markFields) {
          setBasicInfoFieldError(nationalIdField);
        }
      } else if (config.markFields) {
        clearBasicInfoFieldError(nationalIdField);
      }
    }

    return { valid: !hasInvalidField };
  }

  function collectScsrBasicInfoStepValidation(options) {
    const config = {
      markFields: false,
      ...options,
    };
    const requiredFieldIds = new Set(getBasicInfoRequiredFieldIds("SCSR"));
    const basicFields = getBasicInfoRequiredFields("SCSR");
    let hasInvalidField = false;

    basicFields.forEach((field) => {
      const invalid = isBasicInfoFieldEmpty(field);
      if (config.markFields) {
        if (invalid) {
          setBasicInfoFieldError(field);
        } else {
          clearBasicInfoFieldError(field);
        }
      }
      if (invalid) {
        hasInvalidField = true;
      }
    });

    if (basicSexInput) {
      const sexInvalid = !normalizeText(basicSexInput.value);
      if (sexInvalid) {
        hasInvalidField = true;
        if (config.markFields) {
          setBasicInfoFieldError(basicSexInput);
        }
      } else if (config.markFields) {
        clearBasicInfoFieldError(basicSexInput);
      }
    }

    if (basicCivilStatusInput) {
      const civilStatusInvalid = !normalizeText(basicCivilStatusInput.value);
      if (civilStatusInvalid) {
        hasInvalidField = true;
        if (config.markFields) {
          setBasicInfoFieldError(basicCivilStatusInput);
        }
      } else if (config.markFields) {
        clearBasicInfoFieldError(basicCivilStatusInput);
      }
    }

    if (basicGranteeNameInput) {
      const nameInvalid =
        !normalizeText(basicGranteeNameInput.value) ||
        hasNumericCharacters(basicGranteeNameInput.value);
      if (nameInvalid) {
        hasInvalidField = true;
        if (config.markFields) {
          setBasicInfoFieldError(basicGranteeNameInput);
        }
      } else if (config.markFields) {
        clearBasicInfoFieldError(basicGranteeNameInput);
      }
    }

    const contactInfoField = document.getElementById("edit-contact-info");
    if (requiredFieldIds.has("edit-contact-info") && contactInfoField) {
      const contactInfoInvalid = isContactInfoValueInvalid(contactInfoField.value);
      if (contactInfoInvalid) {
        hasInvalidField = true;
        if (config.markFields) {
          setBasicInfoFieldError(contactInfoField);
        }
      } else if (config.markFields) {
        clearBasicInfoFieldError(contactInfoField);
      }
    }

    return { valid: !hasInvalidField };
  }

  function collectBasicInfoStepValidation(options) {
    return activeWorkflowType === "SCSR"
      ? collectScsrBasicInfoStepValidation(options)
      : collectCsrBasicInfoStepValidation(options);
  }

  function collectStepperExportValidation(options) {
    const config = {
      markFields: false,
      ...options,
    };
    const invalidSteps = [];
    const messages = [];

    const basicInfoValidation = collectBasicInfoStepValidation({ markFields: config.markFields });
    if (!basicInfoValidation.valid) {
      invalidSteps.push(1);
      messages.push("Basic Information has missing or invalid fields.");
    }

    const familyValidation = validateFamilyCompositionBeforeManualSave();
    if (!familyValidation.valid) {
      invalidSteps.push(2);
      messages.push("Family Composition has required fields missing.");
    }

    const caseHtml = getCaseDevelopmentEditorHtml();
    const stepThreeInvalid = !normalizeText(caseHtml);
    if (config.markFields) {
      setCaseDevelopmentFieldError(stepThreeInvalid);
    }
    if (stepThreeInvalid) {
      invalidSteps.push(3);
      messages.push(`${getCurrentNarrativeSectionLabel()} is required.`);
    }

    if (activeWorkflowType === "SCSR") {
      const backgroundValidation = collectScsrBackgroundValidation({
        markFields: config.markFields,
      });
      if (!backgroundValidation.valid) {
        invalidSteps.push(4);
        messages.push("Background Information is required for all tabs.");
      }

      const caseAssessmentHtml = getScsrCaseAssessmentEditorHtml() ||
        (currentCsrRecord &&
          currentCsrRecord.caseAssessment &&
          currentCsrRecord.caseAssessment.html);
      const caseAssessmentInvalid = !normalizeText(caseAssessmentHtml);
      if (config.markFields) {
        setScsrCaseAssessmentFieldError(caseAssessmentInvalid);
      }
      if (caseAssessmentInvalid) {
        invalidSteps.push(5);
        messages.push("Case Assessment is required.");
      }

      const hasPlanImplementationItems = getScsrPlanImplementationItems().length > 0;
      if (!hasPlanImplementationItems) {
        invalidSteps.push(6);
        messages.push("Intervention Plan/Plan Implementation requires at least one added item.");
      }

      const caseManagementEvaluationHtml = getScsrCaseManagementEvaluationEditorHtml() ||
        (currentCsrRecord &&
          currentCsrRecord.caseManagementEvaluation &&
          currentCsrRecord.caseManagementEvaluation.html);
      const caseManagementEvaluationInvalid = !normalizeText(caseManagementEvaluationHtml);
      if (config.markFields) {
        setScsrCaseManagementEvaluationFieldError(caseManagementEvaluationInvalid);
      }
      if (caseManagementEvaluationInvalid) {
        invalidSteps.push(7);
        messages.push("Case Management Evaluation is required.");
      }

      const scsrRecommendationMissing = !normalizeText(
        scsrRecommendationTextField && scsrRecommendationTextField.value
      );
      if (config.markFields) {
        if (scsrRecommendationMissing) {
          setModalFieldError(scsrRecommendationTextField);
        } else {
          clearModalFieldError(scsrRecommendationTextField);
        }
      }
      if (scsrRecommendationMissing) {
        invalidSteps.push(8);
        messages.push("Case Recommendation input is required.");
      }
    } else {
      const hasInterventions = getInterventionsProvidedItems().length > 0;
      if (!hasInterventions) {
        invalidSteps.push(4);
        messages.push("Interventions Provided requires at least one added intervention.");
      }

      const hasHouseholdPlans = getHouseholdInterventionPlanItems().length > 0;
      if (!hasHouseholdPlans) {
        invalidSteps.push(5);
        messages.push("Household Intervention Plan requires at least one added plan.");
      }

      const recommendationMissing = !normalizeText(recommendationTextField && recommendationTextField.value);
      if (config.markFields) {
        if (recommendationMissing) {
          setModalFieldError(recommendationTextField);
        } else {
          clearModalFieldError(recommendationTextField);
        }
      }
      if (recommendationMissing) {
        invalidSteps.push(6);
        messages.push("Recommendation input is required.");
      }
    }

    return {
      valid: invalidSteps.length === 0,
      invalidSteps,
      firstInvalidStep: invalidSteps.length ? invalidSteps[0] : null,
      message: messages[0] || "",
    };
  }

  function refreshExportValidationGlow() {
    if (!exportValidationArmed) {
      if (exportInvalidSteps.size > 0) {
        setExportInvalidSteps([]);
      }
      return;
    }
    const validation = collectStepperExportValidation({ markFields: false });
    setExportInvalidSteps(validation.invalidSteps);
  }

  function bindBasicInfoEditValidationListeners() {
    getAllBasicInfoValidationFields().forEach((field) => {
      const eventName =
        field.tagName === "SELECT"
          ? "change"
          : "input";
      field.addEventListener(eventName, () => {
        clearBasicInfoFieldError(field);
        refreshExportValidationGlow();
      });
      if (eventName !== "change") {
        field.addEventListener("change", () => {
          clearBasicInfoFieldError(field);
          refreshExportValidationGlow();
        });
      }
    });
  }

  function bindBasicInfoAutoSaveListeners() {
    getAllBasicInfoValidationFields().forEach((field) => {
      const eventName = field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventName, scheduleBasicInfoAutoSave);
      if (eventName !== "change") {
        field.addEventListener("change", scheduleBasicInfoAutoSave);
      }
    });

    [monthlyIncomeField, perCapitaIncomeField].forEach((field) => {
      if (!field) {
        return;
      }
      field.addEventListener("input", scheduleBasicInfoAutoSave);
      field.addEventListener("change", scheduleBasicInfoAutoSave);
      field.addEventListener("blur", scheduleBasicInfoAutoSave);
    });

    [basicGranteeNameInput, basicSexInput, basicCivilStatusInput].forEach((field) => {
      if (!field) {
        return;
      }
      const eventName = field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventName, scheduleBasicInfoAutoSave);
      if (field === basicGranteeNameInput) {
        field.addEventListener(eventName, () => {
          syncRecommendationHhGranteeField();
          refreshExportValidationGlow();
        });
      }
      if (eventName !== "change") {
        field.addEventListener("change", scheduleBasicInfoAutoSave);
        if (field === basicGranteeNameInput) {
          field.addEventListener("change", () => {
            syncRecommendationHhGranteeField();
            refreshExportValidationGlow();
          });
        }
      }
      field.addEventListener("blur", scheduleBasicInfoAutoSave);
      if (field === basicGranteeNameInput) {
        field.addEventListener("blur", () => {
          syncRecommendationHhGranteeField();
          refreshExportValidationGlow();
        });
      }
    });

    if (basicBirthdayInput) {
      basicBirthdayInput.addEventListener("input", handleBasicBirthdayInputChange);
      basicBirthdayInput.addEventListener("change", handleBasicBirthdayInputChange);
      basicBirthdayInput.addEventListener("blur", handleBasicBirthdayInputChange);
    }
  }

  function bindFamilyCompositionEvents() {
    if (!familyCompositionList) {
      return;
    }
    familyCompositionList.addEventListener("click", handleFamilyCompositionListClick);
    familyCompositionList.addEventListener("input", handleFamilyCompositionInputChange);
    familyCompositionList.addEventListener("change", handleFamilyCompositionInputChange);
    familyCompositionList.addEventListener("toggle", handleFamilyCompositionAccordionToggle, true);
    if (familyCompositionRestoreList) {
      familyCompositionRestoreList.addEventListener("click", handleFamilyCompositionRestoreListClick);
    }
  }

  function bindScsrBackgroundEvents() {
    if (scsrBackgroundTabList) {
      scsrBackgroundTabList.addEventListener("click", handleScsrBackgroundTabClick);
    }
  }

  function bindScsrPlanImplementationEvents() {
    if (scsrPlanImplementationAddButton) {
      scsrPlanImplementationAddButton.addEventListener("click", () => {
        handleScsrPlanImplementationAddRowClick();
      });
    }
    if (scsrPlanImplementationCloseButton) {
      scsrPlanImplementationCloseButton.addEventListener("click", closeScsrPlanImplementationModal);
    }
    if (scsrPlanImplementationCancelButton) {
      scsrPlanImplementationCancelButton.addEventListener("click", closeScsrPlanImplementationModal);
    }
    if (scsrPlanImplementationModal) {
      scsrPlanImplementationModal.addEventListener("click", (event) => {
        if (event.target === scsrPlanImplementationModal) {
          closeScsrPlanImplementationModal();
        }
      });
    }
    if (scsrPlanImplementationModalSaveButton) {
      scsrPlanImplementationModalSaveButton.addEventListener("click", () => {
        void handleScsrPlanImplementationSaveClick();
      });
    }
    if (scsrPlanImplementationList) {
      scsrPlanImplementationList.addEventListener("click", handleScsrPlanImplementationListClick);
      scsrPlanImplementationList.addEventListener("input", handleScsrPlanImplementationInlineInputChange);
      scsrPlanImplementationList.addEventListener("change", handleScsrPlanImplementationInlineInputChange);
    }
    [
      scsrPlanObjectiveField,
      scsrPlanActivitiesField,
      scsrPlanTimeframeField,
      scsrPlanPersonResponsibleField,
      scsrPlanMaterialsNeededField,
      scsrPlanExpectedOutputField,
    ].forEach((field) => {
      if (!field) {
        return;
      }
      field.addEventListener("input", () => autoResizeTextareaField(field));
      field.addEventListener("input", scheduleScsrPlanImplementationDraftAutoSave);
      field.addEventListener("change", scheduleScsrPlanImplementationDraftAutoSave);
      field.addEventListener("input", () => clearModalFieldError(field));
      field.addEventListener("change", () => clearModalFieldError(field));
    });
  }

  function bindEducationalAttainmentLiveSync() {
    const field = document.getElementById("edit-educational-attainment");
    if (!field) {
      return;
    }
    field.addEventListener("change", () => {
      syncGranteeEducationalAttainmentFromBasicToFamilyComposition({
        scheduleAutoSave: true,
      });
    });
  }

  function bindInterventionsProvidedEvents() {
    if (interventionsProvidedAddButton) {
      interventionsProvidedAddButton.addEventListener("click", () => {
        handleInterventionsProvidedAddRowClick();
      });
    }
    if (interventionsProvidedCloseButton) {
      interventionsProvidedCloseButton.addEventListener("click", closeInterventionsProvidedModal);
    }
    if (interventionsProvidedCancelButton) {
      interventionsProvidedCancelButton.addEventListener("click", closeInterventionsProvidedModal);
    }
    if (interventionsProvidedModal) {
      interventionsProvidedModal.addEventListener("click", (event) => {
        if (event.target === interventionsProvidedModal) {
          closeInterventionsProvidedModal();
        }
      });
    }
    if (interventionsProvidedModalSaveButton) {
      interventionsProvidedModalSaveButton.addEventListener("click", () => {
        void handleInterventionProvidedSaveClick();
      });
    }
    if (interventionsProvidedList) {
      interventionsProvidedList.addEventListener("click", handleInterventionsProvidedListClick);
      interventionsProvidedList.addEventListener("input", handleInterventionsProvidedInlineInputChange);
      interventionsProvidedList.addEventListener("change", handleInterventionsProvidedInlineInputChange);
    }
    [
      interventionsProvidedTextField,
      interventionsProvidedDateField,
      interventionsProvidedPartiesField,
    ].forEach((field) => {
      if (!field) {
        return;
      }
      field.addEventListener("input", scheduleInterventionsProvidedDraftAutoSave);
      field.addEventListener("change", scheduleInterventionsProvidedDraftAutoSave);
      field.addEventListener("input", () => autoResizeTextareaField(field));
      field.addEventListener("change", () => autoResizeTextareaField(field));
      field.addEventListener("input", () => clearModalFieldError(field));
      field.addEventListener("change", () => clearModalFieldError(field));
    });
  }

  function handleInterventionsProvidedAddRowClick() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      showToast("No active CSR selected.");
      return;
    }
    const items = getInterventionsProvidedItemsRaw();
    items.push({
      intervention: "",
      dateCompleted: "",
      involvedParties: "",
    });
    currentCsrRecord.interventionsProvided = {
      ...(currentCsrRecord.interventionsProvided || {}),
      items,
    };
    renderInterventionsProvidedRows(items);
    const focusField = interventionsProvidedList.querySelector(
      `[data-ip-index="${items.length - 1}"][data-ip-field="intervention"]`
    );
    if (focusField && typeof focusField.focus === "function") {
      focusField.focus();
    }
  }

  function handleInterventionsProvidedInlineInputChange(event) {
    const target = event && event.target;
    if (!target || !target.matches("[data-ip-field][data-ip-index]")) {
      return;
    }
    autoResizeTextareaField(target);
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    const field = normalizeText(target.getAttribute("data-ip-field"));
    const index = Number.parseInt(target.getAttribute("data-ip-index"), 10);
    if (!Number.isInteger(index) || index < 0) {
      return;
    }
    const allowedFields = new Set(["intervention", "dateCompleted", "involvedParties"]);
    if (!allowedFields.has(field)) {
      return;
    }
    const items = getInterventionsProvidedItemsRaw();
    if (index >= items.length) {
      return;
    }
    items[index][field] = normalizeText(target.value);
    currentCsrRecord.interventionsProvided = {
      ...(currentCsrRecord.interventionsProvided || {}),
      items,
    };
    scheduleInterventionsProvidedAutoSave();
  }

  function getInterventionsProvidedItemsRaw() {
    const stored =
      currentCsrRecord &&
      currentCsrRecord.interventionsProvided &&
      Array.isArray(currentCsrRecord.interventionsProvided.items)
        ? currentCsrRecord.interventionsProvided.items
        : [];
    return stored.map((item) => ({
      intervention: normalizeText(item && item.intervention),
      dateCompleted: normalizeText(item && item.dateCompleted),
      involvedParties: normalizeText(item && item.involvedParties),
    }));
  }

  function getInterventionsProvidedItems() {
    return getInterventionsProvidedItemsRaw()
      .filter((item) => item.intervention || item.dateCompleted || item.involvedParties);
  }

  function collectInterventionsProvidedDraftFromForm() {
    return {
      intervention: normalizeText(
        interventionsProvidedTextField && interventionsProvidedTextField.value
      ),
      dateCompleted: normalizeText(
        interventionsProvidedDateField && interventionsProvidedDateField.value
      ),
      involvedParties: normalizeText(
        interventionsProvidedPartiesField && interventionsProvidedPartiesField.value
      ),
    };
  }

  function hasInterventionsProvidedDraftValues(draft) {
    return !!(
      draft &&
      (normalizeText(draft.intervention) ||
        normalizeText(draft.dateCompleted) ||
        normalizeText(draft.involvedParties))
    );
  }

  function fillInterventionsProvidedFormValues(values) {
    const safeValues = values || {};
    if (interventionsProvidedTextField) {
      interventionsProvidedTextField.value = normalizeText(safeValues.intervention);
      autoResizeTextareaField(interventionsProvidedTextField);
    }
    if (interventionsProvidedDateField) {
      interventionsProvidedDateField.value = normalizeText(safeValues.dateCompleted);
      autoResizeTextareaField(interventionsProvidedDateField);
    }
    if (interventionsProvidedPartiesField) {
      interventionsProvidedPartiesField.value = normalizeText(safeValues.involvedParties);
      autoResizeTextareaField(interventionsProvidedPartiesField);
    }
  }

  function scheduleInterventionsProvidedDraftAutoSave() {
    if (
      !currentCsrRecord ||
      !currentCsrRecord.csrId ||
      !interventionsProvidedModal ||
      interventionsProvidedModal.classList.contains("hidden")
    ) {
      return;
    }
    if (interventionsProvidedDraftAutoSaveTimer) {
      window.clearTimeout(interventionsProvidedDraftAutoSaveTimer);
      interventionsProvidedDraftAutoSaveTimer = null;
    }
    interventionsProvidedDraftAutoSaveTimer = window.setTimeout(() => {
      interventionsProvidedDraftAutoSaveTimer = null;
      void persistInterventionsProvidedDraft({
        showToastOnError: false,
      });
    }, INTERVENTIONS_PROVIDED_DRAFT_AUTOSAVE_DELAY_MS);
  }

  function flushInterventionsProvidedDraftAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (interventionsProvidedDraftAutoSaveTimer) {
      window.clearTimeout(interventionsProvidedDraftAutoSaveTimer);
      interventionsProvidedDraftAutoSaveTimer = null;
      void persistInterventionsProvidedDraft({
        showToastOnError: false,
      });
      return;
    }
    if (shouldForcePersist) {
      void persistInterventionsProvidedDraft({
        showToastOnError: false,
      });
    }
  }

  async function persistInterventionsProvidedDraft(options) {
    const config = {
      showToastOnError: true,
      ...options,
    };
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return false;
    }
    const draft = collectInterventionsProvidedDraftFromForm();
    const existingStore = currentCsrRecord.interventionsProvided || {};
    const nextStore = {
      ...existingStore,
    };
    if (hasInterventionsProvidedDraftValues(draft)) {
      const isEditMode =
        Number.isInteger(interventionsProvidedEditingIndex) &&
        interventionsProvidedEditingIndex >= 0;
      nextStore.draft = {
        mode: isEditMode ? "edit" : "add",
        editIndex: isEditMode ? interventionsProvidedEditingIndex : null,
        ...draft,
        savedAt: new Date().toISOString(),
      };
    } else {
      delete nextStore.draft;
    }
    currentCsrRecord.interventionsProvided = nextStore;
    try {
      await persistCsrRecord(currentCsrRecord);
      return true;
    } catch (_) {
      if (config.showToastOnError) {
        showToast("Unable to save intervention draft right now.");
      }
      return false;
    }
  }

  function scheduleInterventionsProvidedAutoSave() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    if (interventionsProvidedAutoSaveTimer) {
      window.clearTimeout(interventionsProvidedAutoSaveTimer);
      interventionsProvidedAutoSaveTimer = null;
    }
    setInterventionsProvidedSaveStatus("Saving changes...", "pending");
    interventionsProvidedAutoSaveTimer = window.setTimeout(() => {
      interventionsProvidedAutoSaveTimer = null;
      void persistInterventionsProvidedDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
    }, INTERVENTIONS_PROVIDED_AUTOSAVE_DELAY_MS);
  }

  function flushInterventionsProvidedAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (interventionsProvidedAutoSaveTimer) {
      window.clearTimeout(interventionsProvidedAutoSaveTimer);
      interventionsProvidedAutoSaveTimer = null;
      void persistInterventionsProvidedDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
      return;
    }
    if (shouldForcePersist) {
      void persistInterventionsProvidedDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
    }
  }

  async function persistInterventionsProvidedDetails(options) {
    const config = {
      isAutoSave: true,
      showToastOnError: true,
      ...options,
    };
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return false;
    }

    const items = getInterventionsProvidedItemsRaw();
    currentCsrRecord.interventionsProvided = {
      ...(currentCsrRecord.interventionsProvided || {}),
      items,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(currentCsrRecord.interventionsProvided.savedAt);
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setInterventionsProvidedSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setInterventionsProvidedSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Interventions Provided right now.");
      }
      return false;
    }
  }

  function renderInterventionsProvidedRows(items) {
    if (!interventionsProvidedList) {
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      interventionsProvidedList.innerHTML =
        '<tr class="bg-white dark:bg-[#1a2632]"><td colspan="4" class="px-6 py-6 text-center text-slate-500 dark:text-slate-400">No interventions added yet.</td></tr>';
      refreshExportValidationGlow();
      return;
    }
    interventionsProvidedList.innerHTML = items
      .map((item, index) => {
        const intervention = escapeHtml(item.intervention || "");
        const dateCompleted = escapeHtml(item.dateCompleted || "");
        const involvedParties = escapeHtml(item.involvedParties || "");
        return `
          <tr class="bg-white dark:bg-[#1a2632] hover:bg-slate-50 dark:hover:bg-[#1e2b38] transition-colors">
            <td class="px-6 py-4 align-top">
              <textarea data-ip-index="${index}" data-ip-field="intervention" data-auto-resize="true" data-auto-resize-min-height="40" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${intervention}</textarea>
            </td>
            <td class="px-6 py-4 align-top">
              <textarea data-ip-index="${index}" data-ip-field="dateCompleted" data-auto-resize="true" data-auto-resize-min-height="40" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${dateCompleted}</textarea>
            </td>
            <td class="px-6 py-4 align-top">
              <textarea data-ip-index="${index}" data-ip-field="involvedParties" data-auto-resize="true" data-auto-resize-min-height="40" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${involvedParties}</textarea>
            </td>
            <td class="px-6 py-4 align-top text-center">
              <div class="flex items-center justify-center">
                <button type="button" data-ip-delete-index="${index}" class="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-slate-700 rounded transition-colors" title="Delete">
                  <span class="material-symbols-outlined text-[24px]">delete</span>
                </button>
              </div>
            </td>
          </tr>`;
      })
      .join("");
    autoResizeTextareasWithin(interventionsProvidedList);
    refreshExportValidationGlow();
  }

  async function deleteInterventionProvidedRow(index) {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    const items = getInterventionsProvidedItemsRaw();
    if (!Number.isInteger(index) || index < 0 || index >= items.length) {
      return;
    }
    const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
    currentCsrRecord.interventionsProvided = {
      ...(currentCsrRecord.interventionsProvided || {}),
      items: nextItems,
    };
    renderInterventionsProvidedRows(nextItems);
    scheduleInterventionsProvidedAutoSave();
    showToast("Intervention removed.", "success", 2500);
  }

  function applySavedInterventionsProvidedDetails() {
    interventionsProvidedEditingIndex = null;
    renderInterventionsProvidedRows(getInterventionsProvidedItemsRaw());
    const savedAt = normalizeText(
      currentCsrRecord &&
      currentCsrRecord.interventionsProvided &&
      currentCsrRecord.interventionsProvided.savedAt
    );
    if (savedAt) {
      const mode = normalizeText(
        currentCsrRecord &&
        currentCsrRecord.interventionsProvided &&
        currentCsrRecord.interventionsProvided.lastSaveMode
      );
      const label = mode === "autosave" ? "Auto-saved" : "Saved";
      setInterventionsProvidedSaveStatus(
        `${label} ${formatSaveTimeLabel(savedAt)}`,
        "success"
      );
      return;
    }
    setInterventionsProvidedSaveStatus("", "neutral");
  }

  function closeInterventionsProvidedModal() {
    if (!interventionsProvidedModal) {
      return;
    }
    flushInterventionsProvidedDraftAutoSave(true);
    interventionsProvidedModal.classList.add("hidden");
    interventionsProvidedModal.classList.remove("flex");
    interventionsProvidedEditingIndex = null;
    if (interventionsProvidedModalTitle) {
      interventionsProvidedModalTitle.textContent = "Add Intervention";
    }
    [
      interventionsProvidedTextField,
      interventionsProvidedDateField,
      interventionsProvidedPartiesField,
    ].forEach((field) => clearModalFieldError(field));
    fillInterventionsProvidedFormValues(null);
  }

  function handleInterventionsProvidedListClick(event) {
    const deleteButton = event.target.closest("[data-ip-delete-index]");
    if (!deleteButton) {
      return;
    }
    const index = Number.parseInt(deleteButton.getAttribute("data-ip-delete-index"), 10);
    void deleteInterventionProvidedRow(index);
  }

  async function handleInterventionProvidedSaveClick() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      showToast("No active CSR selected.");
      return;
    }
    const validation = validateRequiredModalFields([
      interventionsProvidedTextField,
      interventionsProvidedDateField,
      interventionsProvidedPartiesField,
    ]);
    if (!validation.valid) {
      showToast("Please complete all required Intervention fields.");
      if (
        validation.firstInvalidField &&
        typeof validation.firstInvalidField.focus === "function"
      ) {
        validation.firstInvalidField.focus();
      }
      return;
    }
    const intervention = normalizeText(
      interventionsProvidedTextField && interventionsProvidedTextField.value
    );
    const dateCompleted = normalizeText(
      interventionsProvidedDateField && interventionsProvidedDateField.value
    );
    const involvedParties = normalizeText(
      interventionsProvidedPartiesField && interventionsProvidedPartiesField.value
    );

    const items = getInterventionsProvidedItems();
    const isEditMode =
      Number.isInteger(interventionsProvidedEditingIndex) &&
      interventionsProvidedEditingIndex >= 0 &&
      interventionsProvidedEditingIndex < items.length;
    const payload = {
      intervention,
      dateCompleted,
      involvedParties,
    };
    if (isEditMode) {
      items[interventionsProvidedEditingIndex] = payload;
    } else {
      items.unshift(payload);
    }

    currentCsrRecord.interventionsProvided = {
      ...(currentCsrRecord.interventionsProvided || {}),
      items,
    };
    if (interventionsProvidedDraftAutoSaveTimer) {
      window.clearTimeout(interventionsProvidedDraftAutoSaveTimer);
      interventionsProvidedDraftAutoSaveTimer = null;
    }
    delete currentCsrRecord.interventionsProvided.draft;
    renderInterventionsProvidedRows(items);
    closeInterventionsProvidedModal();
    scheduleInterventionsProvidedAutoSave();
    showToast(
      isEditMode
        ? "Intervention updated."
        : "Intervention added.",
      "success",
      2500
    );
  }

  function handleInterventionsProvidedBackClick() {
    flushInterventionsProvidedDraftAutoSave(true);
    flushInterventionsProvidedAutoSave(true);
    closeInterventionsProvidedModal();
    setActiveCsrStep(3);
  }

  function isActiveScsrPresentingProblemRecord() {
    return !!(
      currentCsrRecord &&
      currentCsrRecord.csrId &&
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) === "SCSR"
    );
  }

  function isActiveScsrCaseAssessmentRecord() {
    return !!(
      currentCsrRecord &&
      currentCsrRecord.csrId &&
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) === "SCSR"
    );
  }

  function isActiveScsrCaseManagementEvaluationRecord() {
    return !!(
      currentCsrRecord &&
      currentCsrRecord.csrId &&
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) === "SCSR"
    );
  }

  function isActiveScsrPlanImplementationRecord() {
    return !!(
      currentCsrRecord &&
      currentCsrRecord.csrId &&
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) === "SCSR"
    );
  }

  function isActiveScsrBackgroundRecord() {
    return !!(
      currentCsrRecord &&
      currentCsrRecord.csrId &&
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) === "SCSR"
    );
  }

  function isActiveScsrRecommendationRecord() {
    return !!(
      currentCsrRecord &&
      currentCsrRecord.csrId &&
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) === "SCSR"
    );
  }

  function getActiveRecordWorkflowType() {
    return normalizeWorkflowType(
      (currentCsrRecord && currentCsrRecord.workflowType) || activeWorkflowType
    );
  }

  function isActiveScsrBasicInfoRecord() {
    return !!currentCsrRecord && !!currentCsrRecord.csrId && getActiveRecordWorkflowType() === "SCSR";
  }

  function isActiveScsrFamilyCompositionRecord() {
    return !!currentCsrRecord && !!currentCsrRecord.csrId && getActiveRecordWorkflowType() === "SCSR";
  }

  function isActiveFamilyCompositionRecord() {
    return !!currentCsrRecord && !!currentCsrRecord.csrId;
  }

  function handleScsrPlanImplementationAddRowClick() {
    if (!isActiveScsrPlanImplementationRecord()) {
      showToast("No active SCSR selected.");
      return;
    }
    const items = getScsrPlanImplementationItemsRaw();
    items.push({
      specificObjective: "",
      activities: "",
      timeframe: "",
      personResponsible: "",
      materialsNeeded: "",
      expectedOutput: "",
    });
    currentCsrRecord.interventionPlanImplementation = {
      ...(currentCsrRecord.interventionPlanImplementation || {}),
      items,
    };
    renderScsrPlanImplementationRows(items);
    const focusField = scsrPlanImplementationList.querySelector(
      `[data-spi-index="${items.length - 1}"][data-spi-field="specificObjective"]`
    );
    if (focusField && typeof focusField.focus === "function") {
      focusField.focus();
    }
  }

  function handleScsrPlanImplementationInlineInputChange(event) {
    const target = event && event.target;
    if (!target || !target.matches("[data-spi-field][data-spi-index]")) {
      return;
    }
    autoResizeTextareaField(target);
    if (!isActiveScsrPlanImplementationRecord()) {
      return;
    }
    const field = normalizeText(target.getAttribute("data-spi-field"));
    const index = Number.parseInt(target.getAttribute("data-spi-index"), 10);
    if (!Number.isInteger(index) || index < 0) {
      return;
    }
    const allowedFields = new Set([
      "specificObjective",
      "activities",
      "timeframe",
      "personResponsible",
      "materialsNeeded",
      "expectedOutput",
    ]);
    if (!allowedFields.has(field)) {
      return;
    }
    const items = getScsrPlanImplementationItemsRaw();
    if (index >= items.length) {
      return;
    }
    items[index][field] = normalizeText(target.value);
    currentCsrRecord.interventionPlanImplementation = {
      ...(currentCsrRecord.interventionPlanImplementation || {}),
      items,
    };
    scheduleScsrPlanImplementationAutoSave();
  }

  function getScsrPlanImplementationItemsRaw() {
    const stored =
      currentCsrRecord &&
      currentCsrRecord.interventionPlanImplementation &&
      Array.isArray(currentCsrRecord.interventionPlanImplementation.items)
        ? currentCsrRecord.interventionPlanImplementation.items
        : [];
    return stored.map((item) => ({
      specificObjective: normalizeText(item && item.specificObjective),
      activities: normalizeText(item && item.activities),
      timeframe: normalizeText(item && item.timeframe),
      personResponsible: normalizeText(item && item.personResponsible),
      materialsNeeded: normalizeText(item && item.materialsNeeded),
      expectedOutput: normalizeText(item && item.expectedOutput),
    }));
  }

  function getScsrPlanImplementationItems() {
    return getScsrPlanImplementationItemsRaw()
      .filter((item) =>
        item.specificObjective ||
        item.activities ||
        item.timeframe ||
        item.personResponsible ||
        item.materialsNeeded ||
        item.expectedOutput
      );
  }

  function collectScsrPlanImplementationDraftFromForm() {
    return {
      specificObjective: normalizeText(scsrPlanObjectiveField && scsrPlanObjectiveField.value),
      activities: normalizeText(scsrPlanActivitiesField && scsrPlanActivitiesField.value),
      timeframe: normalizeText(scsrPlanTimeframeField && scsrPlanTimeframeField.value),
      personResponsible: normalizeText(scsrPlanPersonResponsibleField && scsrPlanPersonResponsibleField.value),
      materialsNeeded: normalizeText(scsrPlanMaterialsNeededField && scsrPlanMaterialsNeededField.value),
      expectedOutput: normalizeText(scsrPlanExpectedOutputField && scsrPlanExpectedOutputField.value),
    };
  }

  function autoResizeTextareaField(field) {
    if (!field || String(field.tagName || "").toUpperCase() !== "TEXTAREA") {
      return;
    }
    const computed = window.getComputedStyle ? window.getComputedStyle(field) : null;
    const borderTop = computed ? Number.parseFloat(computed.borderTopWidth || "0") || 0 : 0;
    const borderBottom = computed ? Number.parseFloat(computed.borderBottomWidth || "0") || 0 : 0;
    const minHeight = field.dataset && field.dataset.autoResizeMinHeight
      ? Number.parseFloat(field.dataset.autoResizeMinHeight) || 0
      : 0;
    field.style.height = "auto";
    field.style.height = `${Math.max(field.scrollHeight + borderTop + borderBottom, minHeight)}px`;
  }

  function autoResizeTextareasWithin(root) {
    if (!root || typeof root.querySelectorAll !== "function") {
      return;
    }
    root.querySelectorAll('textarea[data-auto-resize="true"]').forEach((field) => {
      autoResizeTextareaField(field);
    });
  }

  function hasScsrPlanImplementationDraftValues(draft) {
    return !!(
      draft &&
      (
        normalizeText(draft.specificObjective) ||
        normalizeText(draft.activities) ||
        normalizeText(draft.timeframe) ||
        normalizeText(draft.personResponsible) ||
        normalizeText(draft.materialsNeeded) ||
        normalizeText(draft.expectedOutput)
      )
    );
  }

  function fillScsrPlanImplementationFormValues(values) {
    const safeValues = values || {};
    if (scsrPlanObjectiveField) {
      scsrPlanObjectiveField.value = normalizeText(safeValues.specificObjective);
      autoResizeTextareaField(scsrPlanObjectiveField);
    }
    if (scsrPlanActivitiesField) {
      scsrPlanActivitiesField.value = normalizeText(safeValues.activities);
      autoResizeTextareaField(scsrPlanActivitiesField);
    }
    if (scsrPlanTimeframeField) {
      scsrPlanTimeframeField.value = normalizeText(safeValues.timeframe);
      autoResizeTextareaField(scsrPlanTimeframeField);
    }
    if (scsrPlanPersonResponsibleField) {
      scsrPlanPersonResponsibleField.value = normalizeText(safeValues.personResponsible);
      autoResizeTextareaField(scsrPlanPersonResponsibleField);
    }
    if (scsrPlanMaterialsNeededField) {
      scsrPlanMaterialsNeededField.value = normalizeText(safeValues.materialsNeeded);
      autoResizeTextareaField(scsrPlanMaterialsNeededField);
    }
    if (scsrPlanExpectedOutputField) {
      scsrPlanExpectedOutputField.value = normalizeText(safeValues.expectedOutput);
      autoResizeTextareaField(scsrPlanExpectedOutputField);
    }
  }

  function scheduleScsrPlanImplementationDraftAutoSave() {
    if (
      !isActiveScsrPlanImplementationRecord() ||
      !scsrPlanImplementationModal ||
      scsrPlanImplementationModal.classList.contains("hidden")
    ) {
      return;
    }
    if (scsrPlanImplementationDraftAutoSaveTimer) {
      window.clearTimeout(scsrPlanImplementationDraftAutoSaveTimer);
      scsrPlanImplementationDraftAutoSaveTimer = null;
    }
    scsrPlanImplementationDraftAutoSaveTimer = window.setTimeout(() => {
      scsrPlanImplementationDraftAutoSaveTimer = null;
      void persistScsrPlanImplementationDraft({ showToastOnError: false });
    }, INTERVENTIONS_PROVIDED_DRAFT_AUTOSAVE_DELAY_MS);
  }

  function flushScsrPlanImplementationDraftAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (!isActiveScsrPlanImplementationRecord()) {
      if (scsrPlanImplementationDraftAutoSaveTimer) {
        window.clearTimeout(scsrPlanImplementationDraftAutoSaveTimer);
        scsrPlanImplementationDraftAutoSaveTimer = null;
      }
      return;
    }
    if (scsrPlanImplementationDraftAutoSaveTimer) {
      window.clearTimeout(scsrPlanImplementationDraftAutoSaveTimer);
      scsrPlanImplementationDraftAutoSaveTimer = null;
      void persistScsrPlanImplementationDraft({ showToastOnError: false });
      return;
    }
    if (shouldForcePersist) {
      void persistScsrPlanImplementationDraft({ showToastOnError: false });
    }
  }

  async function persistScsrPlanImplementationDraft(options) {
    const config = {
      showToastOnError: true,
      ...options,
    };
    if (!isActiveScsrPlanImplementationRecord()) {
      return false;
    }
    const draft = collectScsrPlanImplementationDraftFromForm();
    const existingStore = currentCsrRecord.interventionPlanImplementation || {};
    const nextStore = { ...existingStore };
    if (hasScsrPlanImplementationDraftValues(draft)) {
      const isEditMode =
        Number.isInteger(scsrPlanImplementationEditingIndex) &&
        scsrPlanImplementationEditingIndex >= 0;
      nextStore.draft = {
        mode: isEditMode ? "edit" : "add",
        editIndex: isEditMode ? scsrPlanImplementationEditingIndex : null,
        ...draft,
        savedAt: new Date().toISOString(),
      };
    } else {
      delete nextStore.draft;
    }
    currentCsrRecord.interventionPlanImplementation = nextStore;
    try {
      await persistCsrRecord(currentCsrRecord);
      return true;
    } catch (_) {
      if (config.showToastOnError) {
        showToast("Unable to save SCSR intervention draft right now.");
      }
      return false;
    }
  }

  function scheduleScsrPlanImplementationAutoSave() {
    if (!isActiveScsrPlanImplementationRecord()) {
      return;
    }
    if (scsrPlanImplementationAutoSaveTimer) {
      window.clearTimeout(scsrPlanImplementationAutoSaveTimer);
      scsrPlanImplementationAutoSaveTimer = null;
    }
    setScsrPlanImplementationSaveStatus("Saving changes...", "pending");
    scsrPlanImplementationAutoSaveTimer = window.setTimeout(() => {
      scsrPlanImplementationAutoSaveTimer = null;
      void persistScsrPlanImplementationDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
    }, INTERVENTIONS_PROVIDED_AUTOSAVE_DELAY_MS);
  }

  function flushScsrPlanImplementationAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (!isActiveScsrPlanImplementationRecord()) {
      if (scsrPlanImplementationAutoSaveTimer) {
        window.clearTimeout(scsrPlanImplementationAutoSaveTimer);
        scsrPlanImplementationAutoSaveTimer = null;
      }
      return;
    }
    if (scsrPlanImplementationAutoSaveTimer) {
      window.clearTimeout(scsrPlanImplementationAutoSaveTimer);
      scsrPlanImplementationAutoSaveTimer = null;
      void persistScsrPlanImplementationDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
      return;
    }
    if (shouldForcePersist) {
      void persistScsrPlanImplementationDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
    }
  }

  async function persistScsrPlanImplementationDetails(options) {
    const config = {
      isAutoSave: true,
      showToastOnError: true,
      ...options,
    };
    if (!isActiveScsrPlanImplementationRecord()) {
      return false;
    }

    const items = getScsrPlanImplementationItemsRaw();
    currentCsrRecord.interventionPlanImplementation = {
      ...(currentCsrRecord.interventionPlanImplementation || {}),
      items,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(currentCsrRecord.interventionPlanImplementation.savedAt);
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setScsrPlanImplementationSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setScsrPlanImplementationSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Intervention Plan/Plan Implementation right now.");
      }
      return false;
    }
  }

  function renderScsrPlanImplementationRows(items) {
    if (!scsrPlanImplementationList) {
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      scsrPlanImplementationList.innerHTML =
        '<tr class="bg-white dark:bg-[#1a2632]"><td colspan="7" class="px-6 py-6 text-center text-slate-500 dark:text-slate-400">No plan items added yet.</td></tr>';
      refreshExportValidationGlow();
      return;
    }
    scsrPlanImplementationList.innerHTML = items
      .map((item, index) => {
        const specificObjective = escapeHtml(item.specificObjective || "");
        const activities = escapeHtml(item.activities || "");
        const timeframe = escapeHtml(item.timeframe || "");
        const personResponsible = escapeHtml(item.personResponsible || "");
        const materialsNeeded = escapeHtml(item.materialsNeeded || "");
        const expectedOutput = escapeHtml(item.expectedOutput || "");
        return `
          <tr class="bg-white dark:bg-[#1a2632] hover:bg-slate-50 dark:hover:bg-[#1e2b38] transition-colors">
            <td class="px-6 py-4 align-top"><textarea data-spi-index="${index}" data-spi-field="specificObjective" data-auto-resize="true" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${specificObjective}</textarea></td>
            <td class="px-6 py-4 align-top"><textarea data-spi-index="${index}" data-spi-field="activities" data-auto-resize="true" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${activities}</textarea></td>
            <td class="px-6 py-4 align-top"><textarea data-spi-index="${index}" data-spi-field="timeframe" data-auto-resize="true" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${timeframe}</textarea></td>
            <td class="px-6 py-4 align-top"><textarea data-spi-index="${index}" data-spi-field="personResponsible" data-auto-resize="true" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${personResponsible}</textarea></td>
            <td class="px-6 py-4 align-top"><textarea data-spi-index="${index}" data-spi-field="materialsNeeded" data-auto-resize="true" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${materialsNeeded}</textarea></td>
            <td class="px-6 py-4 align-top"><textarea data-spi-index="${index}" data-spi-field="expectedOutput" data-auto-resize="true" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${expectedOutput}</textarea></td>
            <td class="px-6 py-4 align-top text-center">
              <div class="flex items-center justify-center">
                <button type="button" data-spi-delete-index="${index}" class="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-slate-700 rounded transition-colors" title="Delete">
                  <span class="material-symbols-outlined text-[24px]">delete</span>
                </button>
              </div>
            </td>
          </tr>`;
      })
      .join("");
    autoResizeTextareasWithin(scsrPlanImplementationList);
    refreshExportValidationGlow();
  }

  async function deleteScsrPlanImplementationRow(index) {
    if (!isActiveScsrPlanImplementationRecord()) {
      return;
    }
    const items = getScsrPlanImplementationItemsRaw();
    if (!Number.isInteger(index) || index < 0 || index >= items.length) {
      return;
    }
    const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
    currentCsrRecord.interventionPlanImplementation = {
      ...(currentCsrRecord.interventionPlanImplementation || {}),
      items: nextItems,
    };
    renderScsrPlanImplementationRows(nextItems);
    scheduleScsrPlanImplementationAutoSave();
    showToast("Plan item removed.", "success", 2500);
  }

  function applySavedScsrPlanImplementationDetails() {
    scsrPlanImplementationEditingIndex = null;
    renderScsrPlanImplementationRows(getScsrPlanImplementationItemsRaw());
    const savedAt = normalizeText(
      currentCsrRecord &&
      currentCsrRecord.interventionPlanImplementation &&
      currentCsrRecord.interventionPlanImplementation.savedAt
    );
    if (savedAt) {
      const mode = normalizeText(
        currentCsrRecord &&
        currentCsrRecord.interventionPlanImplementation &&
        currentCsrRecord.interventionPlanImplementation.lastSaveMode
      );
      const label = mode === "autosave" ? "Auto-saved" : "Saved";
      setScsrPlanImplementationSaveStatus(`${label} ${formatSaveTimeLabel(savedAt)}`, "success");
      return;
    }
    setScsrPlanImplementationSaveStatus("", "neutral");
  }

  function closeScsrPlanImplementationModal() {
    if (!scsrPlanImplementationModal) {
      return;
    }
    flushScsrPlanImplementationDraftAutoSave(true);
    scsrPlanImplementationModal.classList.add("hidden");
    scsrPlanImplementationModal.classList.remove("flex");
    scsrPlanImplementationEditingIndex = null;
    if (scsrPlanImplementationModalTitle) {
      scsrPlanImplementationModalTitle.textContent = "Add Plan Item";
    }
    [
      scsrPlanObjectiveField,
      scsrPlanActivitiesField,
      scsrPlanTimeframeField,
      scsrPlanPersonResponsibleField,
      scsrPlanMaterialsNeededField,
      scsrPlanExpectedOutputField,
    ].forEach((field) => clearModalFieldError(field));
    fillScsrPlanImplementationFormValues(null);
  }

  function handleScsrPlanImplementationListClick(event) {
    const deleteButton = event.target.closest("[data-spi-delete-index]");
    if (!deleteButton) {
      return;
    }
    const index = Number.parseInt(deleteButton.getAttribute("data-spi-delete-index"), 10);
    void deleteScsrPlanImplementationRow(index);
  }

  async function handleScsrPlanImplementationSaveClick() {
    if (!isActiveScsrPlanImplementationRecord()) {
      showToast("No active SCSR selected.");
      return;
    }
    const validation = validateRequiredModalFields([
      scsrPlanObjectiveField,
      scsrPlanActivitiesField,
      scsrPlanTimeframeField,
      scsrPlanPersonResponsibleField,
      scsrPlanMaterialsNeededField,
      scsrPlanExpectedOutputField,
    ]);
    if (!validation.valid) {
      showToast("Please complete all required fields.");
      if (validation.firstInvalidField && typeof validation.firstInvalidField.focus === "function") {
        validation.firstInvalidField.focus();
      }
      return;
    }

    const payload = {
      specificObjective: normalizeText(scsrPlanObjectiveField && scsrPlanObjectiveField.value),
      activities: normalizeText(scsrPlanActivitiesField && scsrPlanActivitiesField.value),
      timeframe: normalizeText(scsrPlanTimeframeField && scsrPlanTimeframeField.value),
      personResponsible: normalizeText(scsrPlanPersonResponsibleField && scsrPlanPersonResponsibleField.value),
      materialsNeeded: normalizeText(scsrPlanMaterialsNeededField && scsrPlanMaterialsNeededField.value),
      expectedOutput: normalizeText(scsrPlanExpectedOutputField && scsrPlanExpectedOutputField.value),
    };

    const items = getScsrPlanImplementationItems();
    const isEditMode =
      Number.isInteger(scsrPlanImplementationEditingIndex) &&
      scsrPlanImplementationEditingIndex >= 0 &&
      scsrPlanImplementationEditingIndex < items.length;
    if (isEditMode) {
      items[scsrPlanImplementationEditingIndex] = payload;
    } else {
      items.unshift(payload);
    }

    currentCsrRecord.interventionPlanImplementation = {
      ...(currentCsrRecord.interventionPlanImplementation || {}),
      items,
    };
    if (scsrPlanImplementationDraftAutoSaveTimer) {
      window.clearTimeout(scsrPlanImplementationDraftAutoSaveTimer);
      scsrPlanImplementationDraftAutoSaveTimer = null;
    }
    delete currentCsrRecord.interventionPlanImplementation.draft;
    renderScsrPlanImplementationRows(items);
    closeScsrPlanImplementationModal();
    scheduleScsrPlanImplementationAutoSave();
    showToast(isEditMode ? "Plan item updated." : "Plan item added.", "success", 2500);
  }

  function handleScsrPlanImplementationBackClick() {
    flushScsrPlanImplementationDraftAutoSave(true);
    flushScsrPlanImplementationAutoSave(true);
    closeScsrPlanImplementationModal();
    setActiveCsrStep(5);
  }

  function bindHouseholdInterventionPlanEvents() {
    if (householdInterventionPlanAddButton) {
      householdInterventionPlanAddButton.addEventListener("click", () => {
        handleHouseholdInterventionPlanAddRowClick();
      });
    }
    if (householdInterventionPlanCloseButton) {
      householdInterventionPlanCloseButton.addEventListener("click", closeHouseholdInterventionPlanModal);
    }
    if (householdInterventionPlanCancelButton) {
      householdInterventionPlanCancelButton.addEventListener("click", closeHouseholdInterventionPlanModal);
    }
    if (householdInterventionPlanModal) {
      householdInterventionPlanModal.addEventListener("click", (event) => {
        if (event.target === householdInterventionPlanModal) {
          closeHouseholdInterventionPlanModal();
        }
      });
    }
    if (householdInterventionPlanModalSaveButton) {
      householdInterventionPlanModalSaveButton.addEventListener("click", () => {
        void handleHouseholdInterventionPlanModalSaveClick();
      });
    }
    if (householdInterventionPlanList) {
      householdInterventionPlanList.addEventListener("click", handleHouseholdInterventionPlanListClick);
      householdInterventionPlanList.addEventListener("input", handleHouseholdInterventionPlanInlineInputChange);
      householdInterventionPlanList.addEventListener("change", handleHouseholdInterventionPlanInlineInputChange);
    }
    [
      householdInterventionPlanObjectivesField,
      householdInterventionPlanActivitiesField,
      householdInterventionPlanResponsibleField,
      householdInterventionPlanTimelineField,
      householdInterventionPlanOutcomeField,
    ].forEach((field) => {
      if (!field) {
        return;
      }
      field.addEventListener("input", scheduleHouseholdInterventionPlanDraftAutoSave);
      field.addEventListener("change", scheduleHouseholdInterventionPlanDraftAutoSave);
      field.addEventListener("input", () => autoResizeTextareaField(field));
      field.addEventListener("change", () => autoResizeTextareaField(field));
      field.addEventListener("input", () => clearModalFieldError(field));
      field.addEventListener("change", () => clearModalFieldError(field));
    });
  }

  function handleHouseholdInterventionPlanAddRowClick() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      showToast("No active CSR selected.");
      return;
    }
    const items = getHouseholdInterventionPlanItemsRaw();
    items.push({
      objectives: "",
      activities: "",
      responsible: "",
      timeline: "",
      outcome: "",
    });
    currentCsrRecord.householdInterventionPlan = {
      ...(currentCsrRecord.householdInterventionPlan || {}),
      items,
    };
    renderHouseholdInterventionPlanRows(items);
    const focusField = householdInterventionPlanList.querySelector(
      `[data-hip-index="${items.length - 1}"][data-hip-field="objectives"]`
    );
    if (focusField && typeof focusField.focus === "function") {
      focusField.focus();
    }
  }

  function handleHouseholdInterventionPlanInlineInputChange(event) {
    const target = event && event.target;
    if (!target || !target.matches("[data-hip-field][data-hip-index]")) {
      return;
    }
    autoResizeTextareaField(target);
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    const field = normalizeText(target.getAttribute("data-hip-field"));
    const index = Number.parseInt(target.getAttribute("data-hip-index"), 10);
    if (!Number.isInteger(index) || index < 0) {
      return;
    }
    const allowedFields = new Set(["objectives", "activities", "responsible", "timeline", "outcome"]);
    if (!allowedFields.has(field)) {
      return;
    }
    const items = getHouseholdInterventionPlanItemsRaw();
    if (index >= items.length) {
      return;
    }
    items[index][field] = normalizeText(target.value);
    currentCsrRecord.householdInterventionPlan = {
      ...(currentCsrRecord.householdInterventionPlan || {}),
      items,
    };
    scheduleHouseholdInterventionPlanAutoSave();
  }

  function getHouseholdInterventionPlanItemsRaw() {
    const stored =
      currentCsrRecord &&
      currentCsrRecord.householdInterventionPlan &&
      Array.isArray(currentCsrRecord.householdInterventionPlan.items)
        ? currentCsrRecord.householdInterventionPlan.items
        : [];
    return stored.map((item) => ({
      objectives: normalizeText(item && item.objectives),
      activities: normalizeText(item && item.activities),
      responsible: normalizeText(item && item.responsible),
      timeline: normalizeText(item && item.timeline),
      outcome: normalizeText(item && item.outcome),
    }));
  }

  function getHouseholdInterventionPlanItems() {
    return getHouseholdInterventionPlanItemsRaw()
      .filter((item) =>
        item.objectives ||
        item.activities ||
        item.responsible ||
        item.timeline ||
        item.outcome
      );
  }

  function collectHouseholdInterventionPlanDraftFromForm() {
    return {
      objectives: normalizeText(
        householdInterventionPlanObjectivesField &&
        householdInterventionPlanObjectivesField.value
      ),
      activities: normalizeText(
        householdInterventionPlanActivitiesField &&
        householdInterventionPlanActivitiesField.value
      ),
      responsible: normalizeText(
        householdInterventionPlanResponsibleField &&
        householdInterventionPlanResponsibleField.value
      ),
      timeline: normalizeText(
        householdInterventionPlanTimelineField &&
        householdInterventionPlanTimelineField.value
      ),
      outcome: normalizeText(
        householdInterventionPlanOutcomeField &&
        householdInterventionPlanOutcomeField.value
      ),
    };
  }

  function hasHouseholdInterventionPlanDraftValues(draft) {
    return !!(
      draft &&
      (
        normalizeText(draft.objectives) ||
        normalizeText(draft.activities) ||
        normalizeText(draft.responsible) ||
        normalizeText(draft.timeline) ||
        normalizeText(draft.outcome)
      )
    );
  }

  function fillHouseholdInterventionPlanFormValues(values) {
    const safeValues = values || {};
    if (householdInterventionPlanObjectivesField) {
      householdInterventionPlanObjectivesField.value = normalizeText(safeValues.objectives);
      autoResizeTextareaField(householdInterventionPlanObjectivesField);
    }
    if (householdInterventionPlanActivitiesField) {
      householdInterventionPlanActivitiesField.value = normalizeText(safeValues.activities);
      autoResizeTextareaField(householdInterventionPlanActivitiesField);
    }
    if (householdInterventionPlanResponsibleField) {
      householdInterventionPlanResponsibleField.value = normalizeText(safeValues.responsible);
      autoResizeTextareaField(householdInterventionPlanResponsibleField);
    }
    if (householdInterventionPlanTimelineField) {
      householdInterventionPlanTimelineField.value = normalizeText(safeValues.timeline);
      autoResizeTextareaField(householdInterventionPlanTimelineField);
    }
    if (householdInterventionPlanOutcomeField) {
      householdInterventionPlanOutcomeField.value = normalizeText(safeValues.outcome);
      autoResizeTextareaField(householdInterventionPlanOutcomeField);
    }
  }

  function scheduleHouseholdInterventionPlanDraftAutoSave() {
    if (
      !currentCsrRecord ||
      !currentCsrRecord.csrId ||
      !householdInterventionPlanModal ||
      householdInterventionPlanModal.classList.contains("hidden")
    ) {
      return;
    }
    if (householdInterventionPlanDraftAutoSaveTimer) {
      window.clearTimeout(householdInterventionPlanDraftAutoSaveTimer);
      householdInterventionPlanDraftAutoSaveTimer = null;
    }
    householdInterventionPlanDraftAutoSaveTimer = window.setTimeout(() => {
      householdInterventionPlanDraftAutoSaveTimer = null;
      void persistHouseholdInterventionPlanDraft({
        showToastOnError: false,
      });
    }, HOUSEHOLD_INTERVENTION_PLAN_DRAFT_AUTOSAVE_DELAY_MS);
  }

  function flushHouseholdInterventionPlanDraftAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (householdInterventionPlanDraftAutoSaveTimer) {
      window.clearTimeout(householdInterventionPlanDraftAutoSaveTimer);
      householdInterventionPlanDraftAutoSaveTimer = null;
      void persistHouseholdInterventionPlanDraft({
        showToastOnError: false,
      });
      return;
    }
    if (shouldForcePersist) {
      void persistHouseholdInterventionPlanDraft({
        showToastOnError: false,
      });
    }
  }

  async function persistHouseholdInterventionPlanDraft(options) {
    const config = {
      showToastOnError: true,
      ...options,
    };
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return false;
    }
    const draft = collectHouseholdInterventionPlanDraftFromForm();
    const existingStore = currentCsrRecord.householdInterventionPlan || {};
    const nextStore = {
      ...existingStore,
    };
    if (hasHouseholdInterventionPlanDraftValues(draft)) {
      const isEditMode =
        Number.isInteger(householdInterventionPlanEditingIndex) &&
        householdInterventionPlanEditingIndex >= 0;
      nextStore.draft = {
        mode: isEditMode ? "edit" : "add",
        editIndex: isEditMode ? householdInterventionPlanEditingIndex : null,
        ...draft,
        savedAt: new Date().toISOString(),
      };
    } else {
      delete nextStore.draft;
    }
    currentCsrRecord.householdInterventionPlan = nextStore;
    try {
      await persistCsrRecord(currentCsrRecord);
      return true;
    } catch (_) {
      if (config.showToastOnError) {
        showToast("Unable to save household intervention draft right now.");
      }
      return false;
    }
  }

  function scheduleHouseholdInterventionPlanAutoSave() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    if (householdInterventionPlanAutoSaveTimer) {
      window.clearTimeout(householdInterventionPlanAutoSaveTimer);
      householdInterventionPlanAutoSaveTimer = null;
    }
    setHouseholdInterventionPlanSaveStatus("Saving changes...", "pending");
    householdInterventionPlanAutoSaveTimer = window.setTimeout(() => {
      householdInterventionPlanAutoSaveTimer = null;
      void persistHouseholdInterventionPlanDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
    }, HOUSEHOLD_INTERVENTION_PLAN_AUTOSAVE_DELAY_MS);
  }

  function flushHouseholdInterventionPlanAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (householdInterventionPlanAutoSaveTimer) {
      window.clearTimeout(householdInterventionPlanAutoSaveTimer);
      householdInterventionPlanAutoSaveTimer = null;
      void persistHouseholdInterventionPlanDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
      return;
    }
    if (shouldForcePersist) {
      void persistHouseholdInterventionPlanDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
    }
  }

  async function persistHouseholdInterventionPlanDetails(options) {
    const config = {
      isAutoSave: true,
      showToastOnError: true,
      ...options,
    };
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return false;
    }

    const items = getHouseholdInterventionPlanItemsRaw();
    currentCsrRecord.householdInterventionPlan = {
      ...(currentCsrRecord.householdInterventionPlan || {}),
      items,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(currentCsrRecord.householdInterventionPlan.savedAt);
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setHouseholdInterventionPlanSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setHouseholdInterventionPlanSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Household Intervention Plan right now.");
      }
      return false;
    }
  }

  function renderHouseholdInterventionPlanRows(items) {
    if (!householdInterventionPlanList) {
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      householdInterventionPlanList.innerHTML =
        '<tr class="bg-white dark:bg-[#1a2632]"><td colspan="6" class="px-6 py-6 text-center text-slate-500 dark:text-slate-400">No intervention plans added yet.</td></tr>';
      refreshExportValidationGlow();
      return;
    }
    householdInterventionPlanList.innerHTML = items
      .map((item, index) => {
        const objectives = escapeHtml(item.objectives || "");
        const activities = escapeHtml(item.activities || "");
        const responsible = escapeHtml(item.responsible || "");
        const timeline = escapeHtml(item.timeline || "");
        const outcome = escapeHtml(item.outcome || "");
        return `
          <tr class="bg-white dark:bg-[#1a2632] hover:bg-slate-50 dark:hover:bg-[#1e2b38] transition-colors">
            <td class="px-6 py-4 align-top">
              <textarea data-hip-index="${index}" data-hip-field="objectives" data-auto-resize="true" data-auto-resize-min-height="40" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${objectives}</textarea>
            </td>
            <td class="px-6 py-4 align-top">
              <textarea data-hip-index="${index}" data-hip-field="activities" data-auto-resize="true" data-auto-resize-min-height="40" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${activities}</textarea>
            </td>
            <td class="px-6 py-4 align-top">
              <textarea data-hip-index="${index}" data-hip-field="responsible" data-auto-resize="true" data-auto-resize-min-height="40" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${responsible}</textarea>
            </td>
            <td class="px-6 py-4 align-top">
              <textarea data-hip-index="${index}" data-hip-field="timeline" data-auto-resize="true" data-auto-resize-min-height="40" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${timeline}</textarea>
            </td>
            <td class="px-6 py-4 align-top">
              <textarea data-hip-index="${index}" data-hip-field="outcome" data-auto-resize="true" data-auto-resize-min-height="40" rows="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none overflow-hidden leading-6">${outcome}</textarea>
            </td>
            <td class="px-4 py-4 align-top text-center">
              <div class="flex items-center justify-center">
                <button type="button" data-hip-delete-index="${index}" class="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-slate-700 rounded transition-colors" title="Delete">
                  <span class="material-symbols-outlined text-[24px]">delete</span>
                </button>
              </div>
            </td>
          </tr>`;
      })
      .join("");
    autoResizeTextareasWithin(householdInterventionPlanList);
    refreshExportValidationGlow();
  }

  async function deleteHouseholdInterventionPlanRow(index) {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    const items = getHouseholdInterventionPlanItemsRaw();
    if (!Number.isInteger(index) || index < 0 || index >= items.length) {
      return;
    }
    const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
    currentCsrRecord.householdInterventionPlan = {
      ...(currentCsrRecord.householdInterventionPlan || {}),
      items: nextItems,
    };
    renderHouseholdInterventionPlanRows(nextItems);
    scheduleHouseholdInterventionPlanAutoSave();
    showToast("Intervention plan removed.", "success", 2500);
  }

  function applySavedHouseholdInterventionPlanDetails() {
    householdInterventionPlanEditingIndex = null;
    renderHouseholdInterventionPlanRows(getHouseholdInterventionPlanItemsRaw());
    const savedAt = normalizeText(
      currentCsrRecord &&
      currentCsrRecord.householdInterventionPlan &&
      currentCsrRecord.householdInterventionPlan.savedAt
    );
    if (savedAt) {
      const mode = normalizeText(
        currentCsrRecord &&
        currentCsrRecord.householdInterventionPlan &&
        currentCsrRecord.householdInterventionPlan.lastSaveMode
      );
      const label = mode === "autosave" ? "Auto-saved" : "Saved";
      setHouseholdInterventionPlanSaveStatus(
        `${label} ${formatSaveTimeLabel(savedAt)}`,
        "success"
      );
      return;
    }
    setHouseholdInterventionPlanSaveStatus("", "neutral");
  }

  function closeHouseholdInterventionPlanModal() {
    if (!householdInterventionPlanModal) {
      return;
    }
    flushHouseholdInterventionPlanDraftAutoSave(true);
    householdInterventionPlanModal.classList.add("hidden");
    householdInterventionPlanModal.classList.remove("flex");
    householdInterventionPlanEditingIndex = null;
    if (householdInterventionPlanModalTitle) {
      householdInterventionPlanModalTitle.textContent = "Household Intervention Plan";
    }
    [
      householdInterventionPlanObjectivesField,
      householdInterventionPlanActivitiesField,
      householdInterventionPlanResponsibleField,
      householdInterventionPlanTimelineField,
      householdInterventionPlanOutcomeField,
    ].forEach((field) => clearModalFieldError(field));
    fillHouseholdInterventionPlanFormValues(null);
  }

  function handleHouseholdInterventionPlanListClick(event) {
    const deleteButton = event.target.closest("[data-hip-delete-index]");
    if (!deleteButton) {
      return;
    }
    const index = Number.parseInt(deleteButton.getAttribute("data-hip-delete-index"), 10);
    void deleteHouseholdInterventionPlanRow(index);
  }

  async function handleHouseholdInterventionPlanModalSaveClick() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      showToast("No active CSR selected.");
      return;
    }
    const validation = validateRequiredModalFields([
      householdInterventionPlanObjectivesField,
      householdInterventionPlanActivitiesField,
      householdInterventionPlanResponsibleField,
      householdInterventionPlanTimelineField,
      householdInterventionPlanOutcomeField,
    ]);
    if (!validation.valid) {
      showToast("Please complete all required Household Intervention Plan fields.");
      if (
        validation.firstInvalidField &&
        typeof validation.firstInvalidField.focus === "function"
      ) {
        validation.firstInvalidField.focus();
      }
      return;
    }
    const payload = collectHouseholdInterventionPlanDraftFromForm();

    const items = getHouseholdInterventionPlanItems();
    const isEditMode =
      Number.isInteger(householdInterventionPlanEditingIndex) &&
      householdInterventionPlanEditingIndex >= 0 &&
      householdInterventionPlanEditingIndex < items.length;
    if (isEditMode) {
      items[householdInterventionPlanEditingIndex] = payload;
    } else {
      items.unshift(payload);
    }
    currentCsrRecord.householdInterventionPlan = {
      ...(currentCsrRecord.householdInterventionPlan || {}),
      items,
    };
    if (householdInterventionPlanDraftAutoSaveTimer) {
      window.clearTimeout(householdInterventionPlanDraftAutoSaveTimer);
      householdInterventionPlanDraftAutoSaveTimer = null;
    }
    delete currentCsrRecord.householdInterventionPlan.draft;
    renderHouseholdInterventionPlanRows(items);
    closeHouseholdInterventionPlanModal();
    scheduleHouseholdInterventionPlanAutoSave();
    showToast(
      isEditMode
        ? "Intervention plan updated."
        : "Intervention plan added.",
      "success",
      2500
    );
  }

  function handleHouseholdInterventionPlanBackClick() {
    flushHouseholdInterventionPlanDraftAutoSave(true);
    flushHouseholdInterventionPlanAutoSave(true);
    closeHouseholdInterventionPlanModal();
    setActiveCsrStep(4);
  }

  function bindRecommendationEvents() {
    [
      recommendationReviewedBySaveButton,
      recommendationNotedBySaveButton,
      recommendationApprovedBySaveButton,
      recommendationMswdOfficerSaveButton,
    ].forEach((button) => {
      if (!button) {
        return;
      }
      button.addEventListener("click", handleRecommendationDefaultNameSaveClick);
    });
    if (recommendationTextField) {
      recommendationTextField.addEventListener("input", () => {
        clearModalFieldError(recommendationTextField);
      });
    }
    const recommendationAutoSaveFields = [
      recommendationTextField,
      recommendationDateField,
      recommendationPreparedByField,
      recommendationHhGranteeField,
    ];

    recommendationAutoSaveFields.forEach((field) => {
      if (!field) {
        return;
      }
      field.addEventListener("input", scheduleRecommendationAutoSave);
      field.addEventListener("change", scheduleRecommendationAutoSave);
    });

    [
      recommendationTextField,
      recommendationDateField,
      recommendationPreparedByField,
      recommendationReviewedByField,
      recommendationNotedByField,
      recommendationApprovedByField,
      recommendationHhGranteeField,
      recommendationMswdOfficerField,
    ].forEach((field) => {
      if (!field) {
        return;
      }
      field.addEventListener("input", refreshExportValidationGlow);
      field.addEventListener("change", refreshExportValidationGlow);
    });
  }

  function bindScsrRecommendationEvents() {
    [
      scsrRecommendationReviewedBySaveButton,
      scsrRecommendationApprovedBySaveButton,
    ].forEach((button) => {
      if (!button) {
        return;
      }
      button.addEventListener("click", handleScsrRecommendationDefaultNameSaveClick);
    });

    if (scsrRecommendationTextField) {
      scsrRecommendationTextField.addEventListener("input", () => {
        clearModalFieldError(scsrRecommendationTextField);
      });
    }

    [
      scsrRecommendationDateField,
      scsrRecommendationTextField,
      scsrRecommendationPreparedByField,
    ].forEach((field) => {
      if (!field) {
        return;
      }
      field.addEventListener("input", scheduleScsrRecommendationAutoSave);
      field.addEventListener("change", scheduleScsrRecommendationAutoSave);
      field.addEventListener("input", refreshExportValidationGlow);
      field.addEventListener("change", refreshExportValidationGlow);
    });
  }

  function getScsrRecommendationDefaultNames() {
    let stored = null;
    try {
      const raw = window.localStorage.getItem(SCSR_RECOMMENDATION_DEFAULT_NAMES_KEY);
      if (raw) {
        stored = JSON.parse(raw);
      }
    } catch (_) {
      stored = null;
    }
    return {
      reviewedBy:
        normalizeText(stored && stored.reviewedBy) ||
        RECOMMENDATION_DEFAULT_NAMES.reviewedBy,
      approvedBy: normalizeText(stored && stored.approvedBy) || SCSR_RECOMMENDATION_APPROVED_BY,
    };
  }

  function setScsrRecommendationDefaultNames(names) {
    const payload = {
      reviewedBy: normalizeText(names && names.reviewedBy),
      approvedBy: normalizeText(names && names.approvedBy) || SCSR_RECOMMENDATION_APPROVED_BY,
    };
    try {
      window.localStorage.setItem(SCSR_RECOMMENDATION_DEFAULT_NAMES_KEY, JSON.stringify(payload));
    } catch (_) {
      // Ignore storage failures.
    }
    return payload;
  }

  function getRecommendationDefaultNames() {
    let stored = null;
    try {
      const raw = window.localStorage.getItem(RECOMMENDATION_DEFAULT_NAMES_KEY);
      if (raw) {
        stored = JSON.parse(raw);
      }
    } catch (_) {
      stored = null;
    }
    return {
      reviewedBy: normalizeText(stored && stored.reviewedBy) || RECOMMENDATION_DEFAULT_NAMES.reviewedBy,
      notedBy: normalizeText(stored && stored.notedBy) || RECOMMENDATION_DEFAULT_NAMES.notedBy,
      approvedBy: normalizeText(stored && stored.approvedBy) || RECOMMENDATION_DEFAULT_NAMES.approvedBy,
      mswdOfficer: normalizeText(stored && stored.mswdOfficer) || RECOMMENDATION_DEFAULT_NAMES.mswdOfficer,
    };
  }

  function setRecommendationDefaultNames(names) {
    const payload = {
      reviewedBy: normalizeText(names && names.reviewedBy) || RECOMMENDATION_DEFAULT_NAMES.reviewedBy,
      notedBy: normalizeText(names && names.notedBy) || RECOMMENDATION_DEFAULT_NAMES.notedBy,
      approvedBy: normalizeText(names && names.approvedBy) || RECOMMENDATION_DEFAULT_NAMES.approvedBy,
      mswdOfficer: normalizeText(names && names.mswdOfficer) || RECOMMENDATION_DEFAULT_NAMES.mswdOfficer,
    };
    try {
      window.localStorage.setItem(RECOMMENDATION_DEFAULT_NAMES_KEY, JSON.stringify(payload));
    } catch (_) {
      // Ignore storage failures.
    }
    return payload;
  }

  function getPhilippinesTodayIsoDate() {
    try {
      const dateFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const formatted = dateFormatter.format(new Date());
      return /^\d{4}-\d{2}-\d{2}$/.test(formatted) ? formatted : "";
    } catch (_) {
      return "";
    }
  }

  function formatBasicInfoBirthdayForDisplay(value) {
    const iso = toFamilyCompositionBirthdayIso(value);
    if (!iso) {
      return normalizeText(value);
    }
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return normalizeText(value);
    }
    const year = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    const day = Number.parseInt(match[3], 10);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return normalizeText(value);
    }
    const displayDate = new Date(Date.UTC(year, month - 1, day));
    try {
      return displayDate.toLocaleDateString("en-PH", {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (_) {
      return normalizeText(value);
    }
  }

  function computeAgeFromBirthday(value) {
    const iso = toFamilyCompositionBirthdayIso(value);
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return "";
    }
    const birthYear = Number.parseInt(match[1], 10);
    const birthMonth = Number.parseInt(match[2], 10);
    const birthDay = Number.parseInt(match[3], 10);
    if (
      !Number.isFinite(birthYear) ||
      !Number.isFinite(birthMonth) ||
      !Number.isFinite(birthDay)
    ) {
      return "";
    }
    const todayIso = getPhilippinesTodayIsoDate();
    const todayMatch = todayIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!todayMatch) {
      return "";
    }
    const todayYear = Number.parseInt(todayMatch[1], 10);
    const todayMonth = Number.parseInt(todayMatch[2], 10);
    const todayDay = Number.parseInt(todayMatch[3], 10);
    if (
      !Number.isFinite(todayYear) ||
      !Number.isFinite(todayMonth) ||
      !Number.isFinite(todayDay)
    ) {
      return "";
    }
    let age = todayYear - birthYear;
    if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
      age -= 1;
    }
    if (!Number.isFinite(age) || age < 0) {
      return "";
    }
    return String(age);
  }

  function applyBasicInfoBirthdayAndAgeValues(birthdayValue, fallbackAge) {
    const birthdayIso = toFamilyCompositionBirthdayIso(birthdayValue);
    if (basicBirthdayInput) {
      basicBirthdayInput.value = birthdayIso;
    }
    if (basicAgeInput) {
      basicAgeInput.value = computeAgeFromBirthday(birthdayIso) || normalizeText(fallbackAge);
    }
  }

  function normalizeSexForComparison(value) {
    return normalizeText(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .trim();
  }

  function resolveBasicSexValue(value) {
    if (!basicSexInput) {
      return "";
    }
    const normalizedTarget = normalizeSexForComparison(value);
    if (!normalizedTarget) {
      return "";
    }
    const options = Array.from(basicSexInput.options || []);
    const directMatch = options.find(
      (option) => normalizeSexForComparison(option.value) === normalizedTarget
    );
    if (directMatch) {
      return directMatch.value;
    }
    if (normalizedTarget === "M") {
      return "MALE";
    }
    if (normalizedTarget === "F") {
      return "FEMALE";
    }
    return "";
  }

  function setBasicSexValue(value, fallbackValue) {
    if (!basicSexInput) {
      return;
    }
    const resolved =
      resolveBasicSexValue(value) ||
      resolveBasicSexValue(fallbackValue) ||
      "";
    basicSexInput.value = resolved;
  }

  function normalizeCivilStatusForComparison(value) {
    return normalizeText(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, " ")
      .trim();
  }

  function resolveBasicCivilStatusValue(value) {
    if (!basicCivilStatusInput) {
      return "";
    }
    const normalizedTarget = normalizeCivilStatusForComparison(value);
    if (!normalizedTarget) {
      return "";
    }
    const options = Array.from(basicCivilStatusInput.options || []);
    const directMatch = options.find(
      (option) => normalizeCivilStatusForComparison(option.value) === normalizedTarget
    );
    if (directMatch) {
      return directMatch.value;
    }

    const aliasMap = new Map([
      ["DIVORCED SEPARATED", "Divorced / Separated"],
      ["DIVORCED OR SEPARATED", "Divorced / Separated"],
      ["MARRIED WITH SPOUSE MIGRANT", "Married with spouse migrant"],
      ["MARRIED WITH SPOUSE PRESENT", "Married with spouse present"],
    ]);
    const aliased = aliasMap.get(normalizedTarget);
    if (!aliased) {
      return "";
    }
    const aliasMatch = options.find((option) => option.value === aliased);
    return aliasMatch ? aliasMatch.value : "";
  }

  function setBasicCivilStatusValue(value, fallbackValue) {
    if (!basicCivilStatusInput) {
      return;
    }
    const resolved =
      resolveBasicCivilStatusValue(value) ||
      resolveBasicCivilStatusValue(fallbackValue) ||
      "";
    basicCivilStatusInput.value = resolved;
  }

  function applySavedBasicInfoSharedFieldEdits(editDetails, prefilledDetails) {
    const safeEditDetails = editDetails && typeof editDetails === "object" ? editDetails : {};
    const safePrefilledDetails =
      prefilledDetails && typeof prefilledDetails === "object" ? prefilledDetails : {};

    if (basicGranteeNameInput) {
      basicGranteeNameInput.value =
        normalizeText(safeEditDetails.granteeName) ||
        normalizeText(safePrefilledDetails.name) ||
        normalizeText(basicGranteeNameInput.value);
    }
    setBasicSexValue(
      normalizeText(safeEditDetails.sex),
      normalizeText(safePrefilledDetails.sex) || normalizeText(basicSexInput && basicSexInput.value)
    );
    applyBasicInfoBirthdayAndAgeValues(
      normalizeText(safeEditDetails.birthday) || normalizeText(safePrefilledDetails.birthday),
      normalizeText(safeEditDetails.age) || normalizeText(safePrefilledDetails.age)
    );
    setBasicCivilStatusValue(
      normalizeText(safeEditDetails.civilStatus),
      normalizeText(safePrefilledDetails.civilStatus) || normalizeText(basicCivilStatusInput.value)
    );
  }

  function reapplySavedBasicInfoSharedFieldEdits() {
    const basicInformation =
      currentCsrRecord &&
      currentCsrRecord.basicInformation &&
      typeof currentCsrRecord.basicInformation === "object"
        ? currentCsrRecord.basicInformation
        : null;
    if (!basicInformation) {
      return;
    }
    applySavedBasicInfoSharedFieldEdits(
      basicInformation.editDetails,
      basicInformation.prefilled
    );
  }

  function handleBasicBirthdayInputChange() {
    applyBasicInfoBirthdayAndAgeValues(
      basicBirthdayInput && basicBirthdayInput.value,
      ""
    );
    scheduleBasicInfoAutoSave();
  }

  function applyRecommendationDefaultNamesToInputs() {
    const defaults = getRecommendationDefaultNames();
    if (recommendationReviewedByField && !normalizeText(recommendationReviewedByField.value)) {
      recommendationReviewedByField.value = defaults.reviewedBy;
    }
    if (recommendationNotedByField && !normalizeText(recommendationNotedByField.value)) {
      recommendationNotedByField.value = defaults.notedBy;
    }
    if (recommendationApprovedByField && !normalizeText(recommendationApprovedByField.value)) {
      recommendationApprovedByField.value = defaults.approvedBy;
    }
    if (recommendationMswdOfficerField && !normalizeText(recommendationMswdOfficerField.value)) {
      recommendationMswdOfficerField.value = defaults.mswdOfficer;
    }
  }

  function getResolvedRecommendationHhGranteeValue(preferredValue) {
    const liveBasicInfo = collectBasicInfoForTemplate();
    return (
      normalizeText(liveBasicInfo && liveBasicInfo.granteeName) ||
      normalizeText(preferredValue) ||
      normalizeText(currentCsrRecord && currentCsrRecord.cardData && currentCsrRecord.cardData.name)
    );
  }

  function syncRecommendationHhGranteeField() {
    if (!recommendationHhGranteeField) {
      return;
    }
    const resolvedValue = getResolvedRecommendationHhGranteeValue(
      recommendationHhGranteeField.value
    );
    if (
      resolvedValue &&
      normalizeText(recommendationHhGranteeField.value) !== normalizeText(resolvedValue)
    ) {
      recommendationHhGranteeField.value = resolvedValue;
    }
  }

  function applyRecommendationStaticPrefill() {
    if (recommendationDateField && !normalizeText(recommendationDateField.value)) {
      recommendationDateField.value = getPhilippinesTodayIsoDate();
    }
    syncRecommendationHhGranteeField();
    applyRecommendationDefaultNamesToInputs();
  }

  function collectRecommendationDetails() {
    return {
      recommendationText: normalizeText(recommendationTextField && recommendationTextField.value),
      date: normalizeText(recommendationDateField && recommendationDateField.value),
      preparedBy: normalizeText(recommendationPreparedByField && recommendationPreparedByField.value),
      reviewedBy: normalizeText(recommendationReviewedByField && recommendationReviewedByField.value),
      notedBy: normalizeText(recommendationNotedByField && recommendationNotedByField.value),
      approvedBy: normalizeText(recommendationApprovedByField && recommendationApprovedByField.value),
      hhGrantee: getResolvedRecommendationHhGranteeValue(
        recommendationHhGranteeField && recommendationHhGranteeField.value
      ),
      mswdOfficer: normalizeText(recommendationMswdOfficerField && recommendationMswdOfficerField.value),
    };
  }

  function applyRecommendationDetailsToInputs(details) {
    const safe = details || {};
    if (recommendationTextField) {
      recommendationTextField.value = normalizeText(safe.recommendationText);
    }
    if (recommendationDateField) {
      recommendationDateField.value = normalizeText(safe.date);
    }
    if (recommendationPreparedByField) {
      recommendationPreparedByField.value = normalizeText(safe.preparedBy);
    }
    if (recommendationReviewedByField) {
      recommendationReviewedByField.value = normalizeText(safe.reviewedBy);
    }
    if (recommendationNotedByField) {
      recommendationNotedByField.value = normalizeText(safe.notedBy);
    }
    if (recommendationApprovedByField) {
      recommendationApprovedByField.value = normalizeText(safe.approvedBy);
    }
    if (recommendationHhGranteeField) {
      recommendationHhGranteeField.value = getResolvedRecommendationHhGranteeValue(safe.hhGrantee);
    }
    if (recommendationMswdOfficerField) {
      recommendationMswdOfficerField.value = normalizeText(safe.mswdOfficer);
    }
  }

  function applySavedRecommendationDetails() {
    const savedDetails =
      currentCsrRecord &&
      currentCsrRecord.recommendation &&
      typeof currentCsrRecord.recommendation === "object"
        ? currentCsrRecord.recommendation
        : null;
    if (savedDetails && savedDetails.details && typeof savedDetails.details === "object") {
      applyRecommendationDetailsToInputs(savedDetails.details);
    } else {
      applyRecommendationDetailsToInputs(null);
    }
    applyRecommendationStaticPrefill();
    void fillPreparedByFromMls();
    const savedAt = normalizeText(
      currentCsrRecord &&
      currentCsrRecord.recommendation &&
      currentCsrRecord.recommendation.savedAt
    );
    if (savedAt) {
      const mode = normalizeText(
        currentCsrRecord &&
        currentCsrRecord.recommendation &&
        currentCsrRecord.recommendation.lastSaveMode
      );
      const label = mode === "autosave" ? "Auto-saved" : "Saved";
      setRecommendationSaveStatus(
        `${label} ${formatSaveTimeLabel(savedAt)}`,
        "success"
      );
    } else {
      setRecommendationSaveStatus("", "neutral");
    }
  }

  function applyScsrRecommendationStaticPrefill() {
    if (scsrRecommendationDateField && !normalizeText(scsrRecommendationDateField.value)) {
      scsrRecommendationDateField.value = getPhilippinesTodayIsoDate();
    }
    const defaults = getScsrRecommendationDefaultNames();
    if (scsrRecommendationReviewedByField && !normalizeText(scsrRecommendationReviewedByField.value)) {
      scsrRecommendationReviewedByField.value = defaults.reviewedBy;
    }
    if (scsrRecommendationApprovedByField && !normalizeText(scsrRecommendationApprovedByField.value)) {
      scsrRecommendationApprovedByField.value = defaults.approvedBy;
    }
  }

  function collectScsrRecommendationDetails() {
    return {
      date: normalizeText(scsrRecommendationDateField && scsrRecommendationDateField.value),
      recommendationText: normalizeText(scsrRecommendationTextField && scsrRecommendationTextField.value),
      preparedBy: normalizeText(scsrRecommendationPreparedByField && scsrRecommendationPreparedByField.value),
      reviewedBy: normalizeText(scsrRecommendationReviewedByField && scsrRecommendationReviewedByField.value),
      approvedBy: normalizeText(scsrRecommendationApprovedByField && scsrRecommendationApprovedByField.value),
    };
  }

  function applyScsrRecommendationDetailsToInputs(details) {
    const safe = details || {};
    if (scsrRecommendationDateField) {
      scsrRecommendationDateField.value = normalizeText(safe.date);
    }
    if (scsrRecommendationTextField) {
      scsrRecommendationTextField.value = normalizeText(safe.recommendationText);
    }
    if (scsrRecommendationPreparedByField) {
      scsrRecommendationPreparedByField.value = normalizeText(safe.preparedBy);
    }
    if (scsrRecommendationReviewedByField) {
      scsrRecommendationReviewedByField.value = normalizeText(safe.reviewedBy);
    }
    if (scsrRecommendationApprovedByField) {
      scsrRecommendationApprovedByField.value = normalizeText(safe.approvedBy);
    }
  }

  function applySavedScsrRecommendationDetails() {
    if (!isActiveScsrRecommendationRecord()) {
      return;
    }
    const savedDetails =
      currentCsrRecord &&
      currentCsrRecord.scsrRecommendation &&
      typeof currentCsrRecord.scsrRecommendation === "object"
        ? currentCsrRecord.scsrRecommendation
        : null;
    if (savedDetails && savedDetails.details && typeof savedDetails.details === "object") {
      applyScsrRecommendationDetailsToInputs(savedDetails.details);
    } else {
      applyScsrRecommendationDetailsToInputs(null);
    }
    applyScsrRecommendationStaticPrefill();
    void fillScsrPreparedByFromMls();
    const savedAt = normalizeText(
      currentCsrRecord &&
      currentCsrRecord.scsrRecommendation &&
      currentCsrRecord.scsrRecommendation.savedAt
    );
    if (savedAt) {
      const mode = normalizeText(
        currentCsrRecord &&
        currentCsrRecord.scsrRecommendation &&
        currentCsrRecord.scsrRecommendation.lastSaveMode
      );
      const label = mode === "autosave" ? "Auto-saved" : "Saved";
      setScsrRecommendationSaveStatus(`${label} ${formatSaveTimeLabel(savedAt)}`, "success");
    } else {
      setScsrRecommendationSaveStatus("", "neutral");
    }
  }

  async function fillPreparedByFromMls() {
    if (!recommendationPreparedByField || normalizeText(recommendationPreparedByField.value)) {
      return;
    }
    if (recommendationPreparedByFetchPromise) {
      await recommendationPreparedByFetchPromise;
      return;
    }
    recommendationPreparedByFetchPromise = (async () => {
      try {
        const uiSession = getUiSession();
        const userId = normalizeText(uiSession && uiSession.id);
        if (!userId) {
          return;
        }
        const mlsRows = await fetchSheetData(LOGIN_SHEET);
        const userRecord = findUserById(mlsRows, userId);
        const name = normalizeText(
          userRecord &&
          (userRecord.NAMES || userRecord.NAME || userRecord.FULL_NAME)
        );
        if (name && recommendationPreparedByField && !normalizeText(recommendationPreparedByField.value)) {
          recommendationPreparedByField.value = name;
        }
      } catch (_) {
        // Keep form usable even when MLS fetch is unavailable.
      }
    })();
    try {
      await recommendationPreparedByFetchPromise;
    } finally {
      recommendationPreparedByFetchPromise = null;
    }
  }

  async function fillScsrPreparedByFromMls() {
    if (
      !isActiveScsrRecommendationRecord() ||
      !scsrRecommendationPreparedByField ||
      normalizeText(scsrRecommendationPreparedByField.value)
    ) {
      return;
    }
    if (scsrRecommendationPreparedByFetchPromise) {
      await scsrRecommendationPreparedByFetchPromise;
      return;
    }
    scsrRecommendationPreparedByFetchPromise = (async () => {
      try {
        const uiSession = getUiSession();
        const userId = normalizeText(uiSession && uiSession.id);
        if (!userId) {
          return;
        }
        const mlsRows = await fetchSheetData(LOGIN_SHEET);
        const userRecord = findUserById(mlsRows, userId);
        const name = normalizeText(
          userRecord &&
          (userRecord.NAMES || userRecord.NAME || userRecord.FULL_NAME)
        );
        if (
          isActiveScsrRecommendationRecord() &&
          name &&
          scsrRecommendationPreparedByField &&
          !normalizeText(scsrRecommendationPreparedByField.value)
        ) {
          scsrRecommendationPreparedByField.value = name;
          scheduleScsrRecommendationAutoSave();
          refreshExportValidationGlow();
        }
      } catch (_) {
        // Keep form usable even when MLS fetch is unavailable.
      }
    })();
    try {
      await scsrRecommendationPreparedByFetchPromise;
    } finally {
      scsrRecommendationPreparedByFetchPromise = null;
    }
  }

  async function persistRecommendationDetails(options) {
    const config = {
      isAutoSave: false,
      showToastOnError: true,
      ...options,
    };
    if (
      !currentCsrRecord ||
      !currentCsrRecord.csrId ||
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) !== "CSR"
    ) {
      return false;
    }
    const details = collectRecommendationDetails();
    if (config.isAutoSave) {
      const existingDetails =
        currentCsrRecord &&
        currentCsrRecord.recommendation &&
        currentCsrRecord.recommendation.details &&
        typeof currentCsrRecord.recommendation.details === "object"
          ? currentCsrRecord.recommendation.details
          : {};
      details.reviewedBy = normalizeText(existingDetails.reviewedBy) || details.reviewedBy;
      details.notedBy = normalizeText(existingDetails.notedBy) || details.notedBy;
      details.approvedBy = normalizeText(existingDetails.approvedBy) || details.approvedBy;
      details.mswdOfficer = normalizeText(existingDetails.mswdOfficer) || details.mswdOfficer;
    }
    currentCsrRecord.recommendation = {
      ...(currentCsrRecord.recommendation || {}),
      details,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };
    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(currentCsrRecord.recommendation.savedAt);
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setRecommendationSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setRecommendationSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Recommendation right now.");
      }
      return false;
    }
  }

  async function persistScsrRecommendationDetails(options) {
    const config = {
      isAutoSave: false,
      showToastOnError: true,
      ...options,
    };
    if (
      !currentCsrRecord ||
      !currentCsrRecord.csrId ||
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) !== "SCSR"
    ) {
      return false;
    }
    const details = collectScsrRecommendationDetails();
    if (config.isAutoSave) {
      const existingDetails =
        currentCsrRecord &&
        currentCsrRecord.scsrRecommendation &&
        currentCsrRecord.scsrRecommendation.details &&
        typeof currentCsrRecord.scsrRecommendation.details === "object"
          ? currentCsrRecord.scsrRecommendation.details
          : {};
      details.reviewedBy = normalizeText(existingDetails.reviewedBy) || details.reviewedBy;
      details.approvedBy = normalizeText(existingDetails.approvedBy) || details.approvedBy;
    }
    currentCsrRecord.scsrRecommendation = {
      ...(currentCsrRecord.scsrRecommendation || {}),
      details,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };
    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(currentCsrRecord.scsrRecommendation.savedAt);
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setScsrRecommendationSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setScsrRecommendationSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Case Recommendation right now.");
      }
      return false;
    }
  }

  async function handleRecommendationDefaultNameSaveClick(event) {
    const button = event && event.currentTarget;
    if (!button) {
      return;
    }
    const defaults = getRecommendationDefaultNames();
    const map = {
      "recommendation-reviewed-by-save-btn": {
        field: recommendationReviewedByField,
        key: "reviewedBy",
      },
      "recommendation-noted-by-save-btn": {
        field: recommendationNotedByField,
        key: "notedBy",
      },
      "recommendation-approved-by-save-btn": {
        field: recommendationApprovedByField,
        key: "approvedBy",
      },
      "recommendation-mswd-officer-save-btn": {
        field: recommendationMswdOfficerField,
        key: "mswdOfficer",
      },
    };
    const target = map[String(button.id || "")];
    if (!target || !target.field) {
      return;
    }
    const value = normalizeText(target.field.value);
    if (!value) {
      showToast("Name is required before saving default.");
      if (typeof target.field.focus === "function") {
        target.field.focus();
      }
      return;
    }
    const nextDefaults = {
      ...defaults,
      [target.key]: value,
    };
    const savedDefaults = setRecommendationDefaultNames(nextDefaults);
    if (recommendationReviewedByField) {
      recommendationReviewedByField.value = savedDefaults.reviewedBy;
    }
    if (recommendationNotedByField) {
      recommendationNotedByField.value = savedDefaults.notedBy;
    }
    if (recommendationApprovedByField) {
      recommendationApprovedByField.value = savedDefaults.approvedBy;
    }
    if (recommendationMswdOfficerField) {
      recommendationMswdOfficerField.value = savedDefaults.mswdOfficer;
    }
    const appliedGlobally = await applyCsrRecommendationDefaultsGlobally(savedDefaults);
    if (!appliedGlobally) {
      await persistRecommendationDetails({
        isAutoSave: false,
        showToastOnError: false,
      });
      showToast("Default name saved locally only (global update failed).", "pending", 2800);
      return;
    }
    refreshExportValidationGlow();
    showToast("Default name saved globally for this municipality.", "success", 2600);
  }

  async function applyCsrRecommendationDefaultsGlobally(defaults) {
    const safeDefaults = {
      reviewedBy: normalizeText(defaults && defaults.reviewedBy),
      notedBy: normalizeText(defaults && defaults.notedBy),
      approvedBy: normalizeText(defaults && defaults.approvedBy),
      mswdOfficer: normalizeText(defaults && defaults.mswdOfficer),
    };
    const municipality = normalizeText(
      (currentCsrRecord &&
        currentCsrRecord.cardData &&
        currentCsrRecord.cardData.municipality) ||
      getActiveMunicipalityForCards()
    ).toUpperCase();
    if (!municipality) {
      return false;
    }
    try {
      const records = await getPrimaryCsrRecordsForMunicipality(municipality, "CSR");
      if (!Array.isArray(records) || !records.length) {
        return true;
      }
      const activeCsrId = String(currentCsrRecord && currentCsrRecord.csrId ? currentCsrRecord.csrId : "");
      const timestamp = new Date().toISOString();
      for (const record of records) {
        if (!record || normalizeWorkflowType(record.workflowType) !== "CSR") {
          continue;
        }
        const existingRecommendation =
          record.recommendation && typeof record.recommendation === "object"
            ? record.recommendation
            : {};
        const existingDetails =
          existingRecommendation.details && typeof existingRecommendation.details === "object"
            ? existingRecommendation.details
            : {};
        const nextDetails = {
          ...existingDetails,
          reviewedBy: safeDefaults.reviewedBy,
          notedBy: safeDefaults.notedBy,
          approvedBy: safeDefaults.approvedBy,
          mswdOfficer: safeDefaults.mswdOfficer,
        };
        const hasChanged =
          normalizeText(existingDetails.reviewedBy) !== safeDefaults.reviewedBy ||
          normalizeText(existingDetails.notedBy) !== safeDefaults.notedBy ||
          normalizeText(existingDetails.approvedBy) !== safeDefaults.approvedBy ||
          normalizeText(existingDetails.mswdOfficer) !== safeDefaults.mswdOfficer;
        if (!hasChanged) {
          continue;
        }
        const nextRecord = {
          ...record,
          recommendation: {
            ...existingRecommendation,
            details: nextDetails,
            savedAt: timestamp,
            lastSaveMode: "autosave",
          },
        };
        await saveCsrRecordToPrimaryStorage(nextRecord);
        if (activeCsrId && String(record.csrId || "") === activeCsrId) {
          currentCsrRecord = nextRecord;
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  async function handleScsrRecommendationDefaultNameSaveClick(event) {
    const button = event && event.currentTarget;
    if (!button) {
      return;
    }
    const defaults = getScsrRecommendationDefaultNames();
    const map = {
      "scsr-recommendation-reviewed-by-save-btn": {
        field: scsrRecommendationReviewedByField,
        key: "reviewedBy",
      },
      "scsr-recommendation-approved-by-save-btn": {
        field: scsrRecommendationApprovedByField,
        key: "approvedBy",
      },
    };
    const target = map[String(button.id || "")];
    if (!target || !target.field) {
      return;
    }
    const value = normalizeText(target.field.value);
    if (!value) {
      showToast("Name is required before saving default.");
      if (typeof target.field.focus === "function") {
        target.field.focus();
      }
      return;
    }
    const nextDefaults = {
      ...defaults,
      [target.key]: value,
    };
    const savedDefaults = setScsrRecommendationDefaultNames(nextDefaults);
    if (scsrRecommendationReviewedByField) {
      scsrRecommendationReviewedByField.value = savedDefaults.reviewedBy;
    }
    if (scsrRecommendationApprovedByField) {
      scsrRecommendationApprovedByField.value = savedDefaults.approvedBy;
    }
    const appliedGlobally = await applyScsrRecommendationDefaultsGlobally(savedDefaults);
    if (!appliedGlobally) {
      await persistScsrRecommendationDetails({
        isAutoSave: false,
        showToastOnError: false,
      });
      showToast("Default name saved locally only (global update failed).", "pending", 2800);
      return;
    }
    refreshExportValidationGlow();
    showToast("Default name saved globally for SCSR in this municipality.", "success", 2800);
  }

  async function applyScsrRecommendationDefaultsGlobally(defaults) {
    const safeDefaults = {
      reviewedBy: normalizeText(defaults && defaults.reviewedBy),
      approvedBy: normalizeText(defaults && defaults.approvedBy),
    };
    const municipality = normalizeText(
      (currentCsrRecord &&
        currentCsrRecord.cardData &&
        currentCsrRecord.cardData.municipality) ||
      getActiveMunicipalityForCards()
    ).toUpperCase();
    if (!municipality) {
      return false;
    }
    try {
      const records = await getPrimaryCsrRecordsForMunicipality(municipality, "SCSR");
      if (!Array.isArray(records) || !records.length) {
        return true;
      }
      const activeCsrId = String(currentCsrRecord && currentCsrRecord.csrId ? currentCsrRecord.csrId : "");
      const timestamp = new Date().toISOString();
      for (const record of records) {
        if (!record || normalizeWorkflowType(record.workflowType) !== "SCSR") {
          continue;
        }
        const existingStore =
          record.scsrRecommendation && typeof record.scsrRecommendation === "object"
            ? record.scsrRecommendation
            : {};
        const existingDetails =
          existingStore.details && typeof existingStore.details === "object"
            ? existingStore.details
            : {};
        const nextDetails = {
          ...existingDetails,
          reviewedBy: safeDefaults.reviewedBy,
          approvedBy: safeDefaults.approvedBy,
        };
        const hasChanged =
          normalizeText(existingDetails.reviewedBy) !== safeDefaults.reviewedBy ||
          normalizeText(existingDetails.approvedBy) !== safeDefaults.approvedBy;
        if (!hasChanged) {
          continue;
        }
        const nextRecord = {
          ...record,
          scsrRecommendation: {
            ...existingStore,
            details: nextDetails,
            savedAt: timestamp,
            lastSaveMode: "autosave",
          },
        };
        await saveCsrRecordToPrimaryStorage(nextRecord);
        if (activeCsrId && String(record.csrId || "") === activeCsrId) {
          currentCsrRecord = nextRecord;
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function handleRecommendationBackClick() {
    flushRecommendationAutoSave(true);
    setActiveCsrStep(5);
  }

  function handleScsrRecommendationBackClick() {
    if (!isActiveScsrRecommendationRecord()) {
      setActiveCsrStep(7);
      return;
    }
    flushScsrRecommendationAutoSave(true);
    setActiveCsrStep(7);
  }

  async function ensureRecommendationSavedForOutput() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      showToast("No active CSR selected.");
      return false;
    }
    if (!normalizeText(recommendationTextField && recommendationTextField.value)) {
      setModalFieldError(recommendationTextField);
      showToast("Recommendation input is required.");
      if (recommendationTextField && typeof recommendationTextField.focus === "function") {
        recommendationTextField.focus();
      }
      return false;
    }
    clearModalFieldError(recommendationTextField);
    if (recommendationDateField && !normalizeText(recommendationDateField.value)) {
      recommendationDateField.value = getPhilippinesTodayIsoDate();
    }
    const saved = await persistRecommendationDetails({
      showToastOnError: true,
    });
    if (!saved) {
      return false;
    }
    return true;
  }

  async function handleRecommendationPrintPreviewClick() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      showToast("No active CSR selected.");
      return;
    }
    clearModalFieldError(recommendationTextField);
    flushRecommendationAutoSave(true);
    if (recommendationDateField && !normalizeText(recommendationDateField.value)) {
      recommendationDateField.value = getPhilippinesTodayIsoDate();
    }
    const opened = await openCsrTemplateWithCurrentData();
    if (opened) {
      showToast("CSR template opened.", "success", 2200);
      return;
    }
    showToast("Unable to open CSR template.", "error", 3000);
  }

  async function handleRecommendationExportClick() {
    if (recommendationPdfExportInProgress) {
      showToast("Export already running. Please wait.", "pending", 2200);
      return;
    }
    let exportSucceeded = false;
    recommendationPdfExportInProgress = true;
    setRecommendationExportButtonBusy(true);
    upsertExportProgressToast(5, "Starting");
    try {
      flushBasicInfoAutoSave();
      flushFamilyCompositionAutoSave();
      flushActiveNarrativeAutoSave(true);
      flushInterventionsProvidedDraftAutoSave(true);
      flushInterventionsProvidedAutoSave(true);
      flushHouseholdInterventionPlanDraftAutoSave(true);
      flushHouseholdInterventionPlanAutoSave(true);
      flushRecommendationAutoSave(true);
      exportValidationArmed = true;
      upsertExportProgressToast(0, "Checking required fields...");
      const validation = collectStepperExportValidation({ markFields: true });
      setExportInvalidSteps(validation.invalidSteps);
      if (!validation.valid) {
        removeExportProgressToast();
        if (validation.firstInvalidStep) {
          setActiveCsrStep(validation.firstInvalidStep);
        }
        showToast(validation.message || "Please complete required fields before export.");
        return;
      }
      upsertExportProgressToast(22, "Saving data");
      const saved = await ensureRecommendationSavedForOutput();
      if (!saved) {
        return;
      }
      setExportInvalidSteps([]);
      upsertExportProgressToast(45, "Preparing PDF");
      const fileName = buildCsrPdfFileName();
      const payload = await buildCsrTemplatePayload();
      upsertExportProgressToast(78, "Saving file");
      try {
        const exportResult = await saveCsrPdfToDesktop(fileName, null, payload);
        await markCurrentCsrRecordAsCompleted(
          normalizeText(exportResult && exportResult.fileName) || fileName
        );
        upsertExportProgressToast(100, "Completed");
        showToast(
          `${normalizeText(exportResult && exportResult.fileName) || fileName} saved to Desktop\\Social Case Report\\CSR.`,
          "success",
          3200
        );
        exportSucceeded = true;
      } catch (error) {
        const details = normalizeText(error && error.message);
        showToast(
          details || "Unable to save PDF to Desktop\\Social Case Report\\CSR.",
          "error",
          4600
        );
      }
    } finally {
      recommendationPdfExportInProgress = false;
      setRecommendationExportButtonBusy(false);
      window.setTimeout(removeExportProgressToast, 900);
      if (exportSucceeded) {
        queueSafeRedirectToDataTableAfterExport();
      }
    }
  }

  async function ensureScsrRecommendationSavedForOutput() {
    if (!isActiveScsrRecommendationRecord()) {
      showToast("No active SCSR selected.");
      return false;
    }
    if (!normalizeText(scsrRecommendationTextField && scsrRecommendationTextField.value)) {
      setModalFieldError(scsrRecommendationTextField);
      showToast("Case Recommendation input is required.");
      if (scsrRecommendationTextField && typeof scsrRecommendationTextField.focus === "function") {
        scsrRecommendationTextField.focus();
      }
      return false;
    }
    clearModalFieldError(scsrRecommendationTextField);
    const saved = await persistScsrRecommendationDetails({
      showToastOnError: true,
    });
    return !!saved;
  }

  async function handleScsrRecommendationPrintPreviewClick() {
    if (!isActiveScsrRecommendationRecord()) {
      showToast("No active SCSR selected.");
      return;
    }
    clearModalFieldError(scsrRecommendationTextField);
    flushScsrRecommendationAutoSave(true);
    const opened = await openScsrTemplateWithCurrentData();
    if (opened) {
      showToast("SCSR template opened.", "success", 2200);
      return;
    }
    showToast("Unable to open SCSR template.", "error", 3000);
  }

  async function handleScsrRecommendationExportClick() {
    if (scsrRecommendationPdfExportInProgress) {
      showToast("Export already running. Please wait.", "pending", 2200);
      return;
    }
    let exportSucceeded = false;
    scsrRecommendationPdfExportInProgress = true;
    setScsrRecommendationExportButtonBusy(true);
    upsertExportProgressToast(5, "Starting");
    try {
      flushBasicInfoAutoSave();
      flushFamilyCompositionAutoSave();
      flushActiveNarrativeAutoSave(true);
      flushScsrBackgroundAutoSave(true);
      flushScsrCaseAssessmentAutoSave(true);
      flushScsrPlanImplementationDraftAutoSave(true);
      flushScsrPlanImplementationAutoSave(true);
      flushScsrCaseManagementEvaluationAutoSave(true);
      flushScsrRecommendationAutoSave(true);
      exportValidationArmed = true;
      upsertExportProgressToast(0, "Checking required fields...");
      const validation = collectStepperExportValidation({ markFields: true });
      setExportInvalidSteps(validation.invalidSteps);
      if (!validation.valid) {
        removeExportProgressToast();
        if (validation.firstInvalidStep) {
          setActiveCsrStep(validation.firstInvalidStep);
        }
        showToast(validation.message || "Please complete required fields before export.");
        return;
      }
      upsertExportProgressToast(22, "Saving data");
      const saved = await ensureScsrRecommendationSavedForOutput();
      if (!saved) {
        return;
      }
      setExportInvalidSteps([]);
      upsertExportProgressToast(45, "Preparing PDF");
      const fileName = buildScsrPdfFileName();
      const payload = await buildScsrTemplatePayload();
      upsertExportProgressToast(78, "Saving file");
      try {
        const exportResult = await saveScsrPdfToDesktop(fileName, null, payload);
        await markCurrentCsrRecordAsCompleted(
          normalizeText(exportResult && exportResult.fileName) || fileName
        );
        upsertExportProgressToast(100, "Completed");
        showToast(
          `${normalizeText(exportResult && exportResult.fileName) || fileName} saved to Desktop\\Social Case Report\\SCSR.`,
          "success",
          3200
        );
        exportSucceeded = true;
      } catch (error) {
        const details = normalizeText(error && error.message);
        showToast(
          details || "Unable to save PDF to Desktop\\Social Case Report\\SCSR.",
          "error",
          4600
        );
      }
    } finally {
      scsrRecommendationPdfExportInProgress = false;
      setScsrRecommendationExportButtonBusy(false);
      window.setTimeout(removeExportProgressToast, 900);
      if (exportSucceeded) {
        queueSafeRedirectToDataTableAfterExport();
      }
    }
  }

  function queueSafeRedirectToDataTableAfterExport() {
    const workspaceVisibleNow =
      !!csrStepper && !csrStepper.classList.contains("hidden");
    if (!workspaceVisibleNow || !currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }

    window.setTimeout(() => {
      const workspaceStillVisible =
        !!csrStepper && !csrStepper.classList.contains("hidden");
      if (
        !workspaceStillVisible ||
        recommendationPdfExportInProgress ||
        scsrRecommendationPdfExportInProgress
      ) {
        return;
      }
      handleReturnToSelectionClick();
    }, EXPORT_SUCCESS_REDIRECT_DELAY_MS);
  }

  function buildCsrPdfFileName() {
    const live = collectBasicInfoForTemplate();
    const fallbackName = normalizeText(
      currentCsrRecord && currentCsrRecord.cardData && currentCsrRecord.cardData.name
    );
    const granteeName = normalizeText(live && live.granteeName) || fallbackName || "CSR";
    const safe = granteeName
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return `${safe || "CSR"}.pdf`;
  }

  function buildScsrPdfFileName() {
    const live = collectBasicInfoForTemplate();
    const fallbackName = normalizeText(
      currentCsrRecord && currentCsrRecord.cardData && currentCsrRecord.cardData.name
    );
    const clientName = normalizeText(live && live.granteeName) || fallbackName || "SCSR";
    const safe = clientName
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return `${safe || "SCSR"}.pdf`;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const base64 = result.includes(",") ? result.split(",").pop() : result;
        resolve(String(base64 || ""));
      };
      reader.onerror = () => reject(reader.error || new Error("Unable to read blob."));
      reader.readAsDataURL(blob);
    });
  }

  async function saveCsrPdfToDesktop(fileName, pdfBlob, payload) {
    const requestBody = { fileName };
    if (payload && typeof payload === "object") {
      requestBody.payload = payload;
    } else if (pdfBlob) {
      requestBody.base64Pdf = await blobToBase64(pdfBlob);
    } else {
      throw new Error("No export payload provided.");
    }
    const response = await fetch("/api/export/csr-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    let responseBody = null;
    try {
      responseBody = await response.json();
    } catch (_) {
      responseBody = null;
    }
    if (!response.ok || !responseBody || responseBody.ok !== true) {
      throw new Error((responseBody && responseBody.error) || "Unable to save PDF.");
    }
    return responseBody;
  }

  async function saveScsrPdfToDesktop(fileName, pdfBlob, payload) {
    const requestBody = { fileName };
    if (payload && typeof payload === "object") {
      requestBody.payload = payload;
    } else if (pdfBlob) {
      requestBody.base64Pdf = await blobToBase64(pdfBlob);
    } else {
      throw new Error("No export payload provided.");
    }
    const response = await fetch("/api/export/scsr-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    let responseBody = null;
    try {
      responseBody = await response.json();
    } catch (_) {
      responseBody = null;
    }
    if (!response.ok || !responseBody || responseBody.ok !== true) {
      throw new Error((responseBody && responseBody.error) || "Unable to save PDF.");
    }
    return responseBody;
  }

  async function openCsrTemplateWithCurrentData() {
    try {
      const wrotePayload = await writeCsrTemplatePayloadSnapshot();
      if (!wrotePayload) {
        return false;
      }
      if (await openCsrTemplateInModalPreview()) {
        return true;
      }
      const templateWindow = window.open(`csr-template.html?printMode=1&t=${Date.now()}`, "_blank");
      if (!templateWindow) {
        return false;
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  async function openScsrTemplateWithCurrentData() {
    try {
      const wrotePayload = await writeScsrTemplatePayloadSnapshot();
      if (!wrotePayload) {
        return false;
      }
      if (await openScsrTemplateInModalPreview()) {
        return true;
      }
      const templateWindow = window.open(`scsr-template.html?printMode=1&t=${Date.now()}`, "_blank");
      if (!templateWindow) {
        return false;
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  async function writeCsrTemplatePayloadSnapshot() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return false;
    }
    try {
      const payload = await buildCsrTemplatePayload();
      const serialized = JSON.stringify(payload);
      window.sessionStorage.setItem(CSR_TEMPLATE_PAYLOAD_KEY, serialized);
      try {
        window.localStorage.setItem(CSR_TEMPLATE_PAYLOAD_KEY, serialized);
      } catch (_) {
        // Ignore localStorage failures; sessionStorage remains available.
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  async function writeScsrTemplatePayloadSnapshot() {
    if (!isActiveScsrRecommendationRecord()) {
      return false;
    }
    try {
      const payload = await buildScsrTemplatePayload();
      const serialized = JSON.stringify(payload);
      window.sessionStorage.setItem(SCSR_TEMPLATE_PAYLOAD_KEY, serialized);
      try {
        window.localStorage.setItem(SCSR_TEMPLATE_PAYLOAD_KEY, serialized);
      } catch (_) {
        // Ignore localStorage failures; sessionStorage remains available.
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  async function waitForRecommendationPreviewReady(timeoutMs = 7000) {
    if (!recommendationPreviewIframe) {
      return false;
    }
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const previewWindow = recommendationPreviewIframe.contentWindow;
      if (previewWindow && previewWindow.__CSR_EXPORT_READY__) {
        return true;
      }
      await wait(120);
    }
    return false;
  }

  function setRecommendationPreviewLoadingVisible(isVisible) {
    if (!recommendationPreviewLoading) {
      return;
    }
    recommendationPreviewLoading.classList.toggle("hidden", !isVisible);
  }

  function setRecommendationPreviewIframeVisible(isVisible) {
    if (!recommendationPreviewIframe) {
      return;
    }
    recommendationPreviewIframe.style.visibility = isVisible ? "visible" : "hidden";
  }

  async function openCsrTemplateInModalPreview() {
    if (!recommendationPreviewModal || !recommendationPreviewIframe) {
      return false;
    }
    setRecommendationPreviewLoadingVisible(true);
    setRecommendationPreviewIframeVisible(false);
    recommendationPreviewModal.classList.remove("hidden");
    recommendationPreviewModal.classList.add("flex");
    recommendationPreviewIframe.setAttribute(
      "src",
      `csr-template.html?embedded=1&printMode=1&t=${Date.now()}`
    );
    const ready = await waitForRecommendationPreviewReady();
    setRecommendationPreviewIframeVisible(true);
    setRecommendationPreviewLoadingVisible(false);
    if (!ready) {
      showToast("Preview is taking longer than expected. Layout may still be settling.", "pending", 2600);
    }
    return true;
  }

  async function waitForScsrRecommendationPreviewReady(timeoutMs = 7000) {
    if (!scsrRecommendationPreviewIframe) {
      return false;
    }
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const previewWindow = scsrRecommendationPreviewIframe.contentWindow;
      if (previewWindow && previewWindow.__CSR_EXPORT_READY__) {
        return true;
      }
      await wait(120);
    }
    return false;
  }

  function getScsrRecommendationPreviewLayoutSignature() {
    if (!scsrRecommendationPreviewIframe) {
      return "";
    }
    const previewWindow = scsrRecommendationPreviewIframe.contentWindow;
    const previewDocument = previewWindow && previewWindow.document;
    if (!previewWindow || !previewDocument) {
      return "";
    }
    const pages = Array.from(
      previewDocument.querySelectorAll(".page-container")
    ).filter((page) => {
      return !page.classList.contains("hidden") && !page.classList.contains("template-page");
    });
    const pageCount = pages.length;
    const body = previewDocument.body;
    const bodyHeight = body ? body.scrollHeight : 0;
    const root = previewDocument.documentElement;
    const readyAttr = root ? root.getAttribute("data-csr-export-ready") || "" : "";
    return `${readyAttr}|${pageCount}|${bodyHeight}`;
  }

  async function waitForScsrRecommendationPreviewStable(timeoutMs = 8500, settleMs = 420) {
    const ready = await waitForScsrRecommendationPreviewReady(timeoutMs);
    if (!ready) {
      return false;
    }
    const start = Date.now();
    let lastSignature = "";
    let stableSince = 0;
    while (Date.now() - start < timeoutMs) {
      const signature = getScsrRecommendationPreviewLayoutSignature();
      if (signature && signature === lastSignature) {
        if (!stableSince) {
          stableSince = Date.now();
        }
        if (Date.now() - stableSince >= settleMs) {
          return true;
        }
      } else {
        lastSignature = signature;
        stableSince = 0;
      }
      await wait(120);
    }
    return false;
  }

  function setScsrRecommendationPreviewLoadingVisible(isVisible) {
    if (!scsrRecommendationPreviewLoading) {
      return;
    }
    scsrRecommendationPreviewLoading.classList.toggle("hidden", !isVisible);
  }

  function setScsrRecommendationPreviewIframeVisible(isVisible) {
    if (!scsrRecommendationPreviewIframe) {
      return;
    }
    scsrRecommendationPreviewIframe.style.visibility = isVisible ? "visible" : "hidden";
  }

  async function openScsrTemplateInModalPreview() {
    if (!scsrRecommendationPreviewModal || !scsrRecommendationPreviewIframe) {
      return false;
    }
    const src = `scsr-template.html?embedded=1&printMode=1&t=${Date.now()}`;
    setScsrRecommendationPreviewLoadingVisible(true);
    setScsrRecommendationPreviewIframeVisible(false);
    scsrRecommendationPreviewModal.classList.remove("hidden");
    scsrRecommendationPreviewModal.classList.add("flex");
    scsrRecommendationPreviewIframe.setAttribute("src", src);
    const ready = await waitForScsrRecommendationPreviewStable();
    setScsrRecommendationPreviewIframeVisible(true);
    setScsrRecommendationPreviewLoadingVisible(false);
    if (!ready) {
      showToast("Preview is taking longer than expected. Layout may still be settling.", "pending", 2600);
    }
    return true;
  }

  function closeRecommendationPreviewModal() {
    if (!recommendationPreviewModal) {
      return;
    }
    setRecommendationPreviewLoadingVisible(false);
    setRecommendationPreviewIframeVisible(true);
    recommendationPreviewModal.classList.add("hidden");
    recommendationPreviewModal.classList.remove("flex");
  }

  function closeScsrRecommendationPreviewModal() {
    if (!scsrRecommendationPreviewModal) {
      return;
    }
    setScsrRecommendationPreviewLoadingVisible(false);
    setScsrRecommendationPreviewIframeVisible(true);
    scsrRecommendationPreviewModal.classList.add("hidden");
    scsrRecommendationPreviewModal.classList.remove("flex");
  }

  async function createTemplateExportTokenUrl(payload) {
    if (!isHttpContext()) {
      return "";
    }
    try {
      const response = await fetch("/api/export/payload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body || body.ok !== true) {
        return "";
      }
      return normalizeText(body.url);
    } catch (_) {
      return "";
    }
  }

  async function createScsrTemplateExportTokenUrl(payload) {
    if (!isHttpContext()) {
      return "";
    }
    try {
      const response = await fetch("/api/export/payload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload, template: "scsr" }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body || body.ok !== true) {
        return "";
      }
      return normalizeText(body.url);
    } catch (_) {
      return "";
    }
  }

  async function openRecommendationPreviewInBrowser() {
    if (!recommendationPreviewIframe) {
      showToast("Preview is not ready to open.", "error", 2400);
      return;
    }
    const rawSrc = normalizeText(
      recommendationPreviewIframe.getAttribute("src") || recommendationPreviewIframe.src
    );
    if (!rawSrc || rawSrc === "about:blank") {
      showToast("Preview is not ready to open.", "error", 2400);
      return;
    }
    try {
      // External browser cannot read Electron/app storage; pass payload via export token.
      const payload = await buildCsrTemplatePayload();
      const tokenUrl = await createTemplateExportTokenUrl(payload);
      const absoluteUrl = tokenUrl || new URL(rawSrc, window.location.href).toString();
      const opened = window.open(absoluteUrl, "_blank", "noopener,noreferrer");
      if (!opened && !isElectronRuntime()) {
        showToast("Unable to open preview in browser.", "error", 2600);
      }
    } catch (_) {
      showToast("Unable to open preview in browser.", "error", 2600);
    }
  }

  async function openScsrRecommendationPreviewInBrowser() {
    if (!scsrRecommendationPreviewIframe) {
      showToast("Preview is not ready to open.", "error", 2400);
      return;
    }
    const rawSrc = normalizeText(
      scsrRecommendationPreviewIframe.getAttribute("src") || scsrRecommendationPreviewIframe.src
    );
    if (!rawSrc || rawSrc === "about:blank") {
      showToast("Preview is not ready to open.", "error", 2400);
      return;
    }
    try {
      const payload = await buildScsrTemplatePayload();
      const tokenUrl = await createScsrTemplateExportTokenUrl(payload);
      const absoluteUrl = tokenUrl || new URL(rawSrc, window.location.href).toString();
      const opened = window.open(absoluteUrl, "_blank", "noopener,noreferrer");
      if (!opened && !isElectronRuntime()) {
        showToast("Unable to open preview in browser.", "error", 2600);
      }
    } catch (_) {
      showToast("Unable to open preview in browser.", "error", 2600);
    }
  }

  function scheduleRecommendationAutoSave() {
    if (
      !currentCsrRecord ||
      !currentCsrRecord.csrId ||
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) !== "CSR"
    ) {
      return;
    }
    if (recommendationAutoSaveTimer) {
      window.clearTimeout(recommendationAutoSaveTimer);
    }
    setRecommendationSaveStatus("Saving changes...", "pending");
    recommendationAutoSaveTimer = window.setTimeout(() => {
      recommendationAutoSaveTimer = null;
      void persistRecommendationDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
    }, RECOMMENDATION_AUTOSAVE_DELAY_MS);
  }

  function scheduleScsrRecommendationAutoSave() {
    if (
      !isActiveScsrRecommendationRecord()
    ) {
      return;
    }
    if (scsrRecommendationAutoSaveTimer) {
      window.clearTimeout(scsrRecommendationAutoSaveTimer);
    }
    setScsrRecommendationSaveStatus("Saving changes...", "pending");
    scsrRecommendationAutoSaveTimer = window.setTimeout(() => {
      scsrRecommendationAutoSaveTimer = null;
      void persistScsrRecommendationDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
    }, RECOMMENDATION_AUTOSAVE_DELAY_MS);
  }

  function flushRecommendationAutoSave(forcePersist) {
    if (
      !currentCsrRecord ||
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) !== "CSR"
    ) {
      if (recommendationAutoSaveTimer) {
        window.clearTimeout(recommendationAutoSaveTimer);
        recommendationAutoSaveTimer = null;
      }
      return;
    }
    const shouldForcePersist = Boolean(forcePersist);
    if (recommendationAutoSaveTimer) {
      window.clearTimeout(recommendationAutoSaveTimer);
      recommendationAutoSaveTimer = null;
      void persistRecommendationDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
      return;
    }
    if (shouldForcePersist) {
      void persistRecommendationDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
    }
  }

  function flushScsrRecommendationAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (!isActiveScsrRecommendationRecord()) {
      if (scsrRecommendationAutoSaveTimer) {
        window.clearTimeout(scsrRecommendationAutoSaveTimer);
        scsrRecommendationAutoSaveTimer = null;
      }
      return;
    }
    if (scsrRecommendationAutoSaveTimer) {
      window.clearTimeout(scsrRecommendationAutoSaveTimer);
      scsrRecommendationAutoSaveTimer = null;
      void persistScsrRecommendationDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
      return;
    }
    if (shouldForcePersist) {
      void persistScsrRecommendationDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
    }
  }

  function flushAllAutoSaveQueues() {
    flushBasicInfoAutoSave();
    flushFamilyCompositionAutoSave();
    flushActiveNarrativeAutoSave(true);
    flushScsrBackgroundAutoSave(true);
    flushScsrCaseAssessmentAutoSave(true);
    flushScsrCaseManagementEvaluationAutoSave(true);
    flushScsrPlanImplementationDraftAutoSave(true);
    flushScsrPlanImplementationAutoSave(true);
    flushScsrRecommendationAutoSave(true);
    flushInterventionsProvidedDraftAutoSave(true);
    flushInterventionsProvidedAutoSave(true);
    flushHouseholdInterventionPlanDraftAutoSave(true);
    flushHouseholdInterventionPlanAutoSave(true);
    flushRecommendationAutoSave(true);
  }

  function bindPageLifecycleAutoSaveFlush() {
    const flushOnClose = () => {
      flushAllAutoSaveQueues();
    };
    window.addEventListener("beforeunload", flushOnClose);
    window.addEventListener("pagehide", flushOnClose);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flushOnClose();
      }
    });
  }

  async function buildCsrTemplatePayload() {
    const basicPrefilled =
      currentCsrRecord &&
      currentCsrRecord.basicInformation &&
      currentCsrRecord.basicInformation.prefilled &&
      typeof currentCsrRecord.basicInformation.prefilled === "object"
        ? currentCsrRecord.basicInformation.prefilled
        : {};
    const basicEdited =
      currentCsrRecord &&
      currentCsrRecord.basicInformation &&
      currentCsrRecord.basicInformation.editDetails &&
      typeof currentCsrRecord.basicInformation.editDetails === "object"
        ? currentCsrRecord.basicInformation.editDetails
        : collectBasicInfoEditDetails();
    const basicInfoLive = collectBasicInfoForTemplate();
    const recommendationDetails = collectRecommendationDetails();
    const caseDevelopmentHtml = normalizeCaseDevelopmentHtmlForStorage(
      getCaseDevelopmentEditorHtml() ||
      (currentCsrRecord &&
        currentCsrRecord.caseDevelopment &&
        currentCsrRecord.caseDevelopment.html)
    );
    const familyMembers = await getFamilyCompositionMembersForTemplate();

    return {
      generatedAt: new Date().toISOString(),
      csrId: normalizeText(currentCsrRecord && currentCsrRecord.csrId),
      basicInfo: {
        date: normalizeText(recommendationDetails.date) || getPhilippinesTodayIsoDate(),
        granteeName:
          normalizeText(basicInfoLive.granteeName) ||
          normalizeText(basicPrefilled.name) ||
          normalizeText(currentCsrRecord && currentCsrRecord.cardData && currentCsrRecord.cardData.name),
        householdId:
          normalizeText(basicInfoLive.householdId) ||
          normalizeText(basicPrefilled.hhid) ||
          normalizeText(currentCsrRecord && currentCsrRecord.cardData && currentCsrRecord.cardData.hhid),
        hhSet:
          normalizeText(basicInfoLive.hhSet) ||
          normalizeText(basicPrefilled.hhSet),
        yearOfRegistration:
          normalizeText(basicInfoLive.yearOfRegistration) ||
          normalizeText(basicEdited.yearOfRegistration) ||
          normalizeText(basicPrefilled.yearOfRegistration),
        yearsInProgram:
          formatYearsInProgramForDisplay(
            normalizeText(basicInfoLive.yearsInProgram) ||
            normalizeText(basicEdited.yearsInProgram)
          ),
        nationalId:
          normalizeText(basicInfoLive.nationalId) ||
          normalizeText(basicEdited.nationalId),
        sex:
          normalizeText(basicInfoLive.sex) ||
          normalizeText(basicPrefilled.sex),
        birthday:
          normalizeText(basicInfoLive.birthday) ||
          normalizeText(basicPrefilled.birthday),
        age:
          normalizeText(basicInfoLive.age) ||
          normalizeText(basicPrefilled.age),
        placeOfBirth:
          normalizeText(basicInfoLive.placeOfBirth) ||
          normalizeText(basicEdited.placeOfBirth),
        civilStatus:
          normalizeText(basicInfoLive.civilStatus) ||
          normalizeText(basicPrefilled.civilStatus),
        presentAddress:
          normalizeText(basicInfoLive.presentAddress) ||
          normalizeText(basicEdited.presentAddress),
        educationalAttainment:
          normalizeText(basicInfoLive.educationalAttainment) ||
          normalizeText(basicEdited.educationalAttainment),
        contactInfo:
          normalizeContactInfoForDisplay(
            normalizeText(basicInfoLive.contactInfo) ||
            normalizeText(basicEdited.contactInfo)
          ),
        religion:
          normalizeText(basicInfoLive.religion) ||
          normalizeText(basicEdited.religion) ||
          normalizeText(basicPrefilled.religion),
        ipAffiliation:
          normalizeText(basicInfoLive.ipAffiliation) ||
          normalizeText(basicPrefilled.ipAffiliation) ||
          "NONE",
        sourceOfInfo:
          normalizeText(basicInfoLive.sourceOfInfo) ||
          normalizeText(basicEdited.sourceOfInfo) ||
          normalizeText(basicEdited.sourceOfIncome),
        previousWellBeingLevel:
          normalizeText(basicInfoLive.previousWellBeingLevel) ||
          normalizeText(basicEdited.prevWellBeingLevel) ||
          normalizeText(basicPrefilled.prevWellBeingLevel),
        clientStatusOnExit:
          normalizeText(basicInfoLive.clientStatusOnExit) ||
          normalizeText(basicEdited.clientStatusOnExit) ||
          normalizeText(basicPrefilled.clientStatusOnExit),
      },
      familyComposition: familyMembers,
      caseDevelopment: {
        html: caseDevelopmentHtml,
      },
      interventionsProvided: getInterventionsProvidedItems(),
      householdInterventionPlan: getHouseholdInterventionPlanItems(),
      recommendation: recommendationDetails,
    };
  }

  async function buildScsrTemplatePayload() {
    const basicPrefilled =
      currentCsrRecord &&
      currentCsrRecord.basicInformation &&
      currentCsrRecord.basicInformation.prefilled &&
      typeof currentCsrRecord.basicInformation.prefilled === "object"
        ? currentCsrRecord.basicInformation.prefilled
        : {};
    const basicEdited =
      currentCsrRecord &&
      currentCsrRecord.basicInformation &&
      currentCsrRecord.basicInformation.editDetails &&
      typeof currentCsrRecord.basicInformation.editDetails === "object"
        ? currentCsrRecord.basicInformation.editDetails
        : collectBasicInfoEditDetails();
    const familyMembers = await getFamilyCompositionMembersForTemplate();
    const storedPresentingProblemHtml =
      currentCsrRecord &&
      currentCsrRecord.presentingProblem &&
      currentCsrRecord.presentingProblem.html;
    const storedCaseAssessmentHtml =
      currentCsrRecord &&
      currentCsrRecord.caseAssessment &&
      currentCsrRecord.caseAssessment.html;
    const storedCaseManagementEvaluationHtml =
      currentCsrRecord &&
      currentCsrRecord.caseManagementEvaluation &&
      currentCsrRecord.caseManagementEvaluation.html;

    const livePresentingProblemHtml =
      normalizeWorkflowType(getActiveRecordWorkflowType()) === "SCSR" && activeCsrStep === 3
        ? getScsrPresentingProblemEditorHtml()
        : "";
    const liveCaseAssessmentHtml =
      normalizeWorkflowType(getActiveRecordWorkflowType()) === "SCSR" && activeCsrStep === 5
        ? getScsrCaseAssessmentEditorHtml()
        : "";
    const liveCaseManagementEvaluationHtml =
      normalizeWorkflowType(getActiveRecordWorkflowType()) === "SCSR" && activeCsrStep === 7
        ? getScsrCaseManagementEvaluationEditorHtml()
        : "";

    const presentingProblemHtml = normalizeCaseDevelopmentHtmlForStorage(
      livePresentingProblemHtml || storedPresentingProblemHtml
    );
    const caseAssessmentHtml = normalizeCaseDevelopmentHtmlForStorage(
      liveCaseAssessmentHtml || storedCaseAssessmentHtml
    );
    const caseManagementEvaluationHtml = normalizeCaseDevelopmentHtmlForStorage(
      liveCaseManagementEvaluationHtml || storedCaseManagementEvaluationHtml
    );
    const scsrRecommendationDetails = collectScsrRecommendationDetails();
    const live = collectBasicInfoForTemplate();
    const dateIso =
      normalizeText(scsrRecommendationDetails.date) ||
      getPhilippinesTodayIsoDate();

    return {
      generatedAt: new Date().toISOString(),
      csrId: normalizeText(currentCsrRecord && currentCsrRecord.csrId),
      workflowType: "SCSR",
      basicInfo: {
        date: dateIso,
        clientName:
          normalizeText(live.granteeName) ||
          normalizeText(basicPrefilled.name) ||
          normalizeText(currentCsrRecord && currentCsrRecord.cardData && currentCsrRecord.cardData.name),
        householdId:
          normalizeText(live.householdId) ||
          normalizeText(basicPrefilled.hhid) ||
          normalizeText(currentCsrRecord && currentCsrRecord.cardData && currentCsrRecord.cardData.hhid),
        hhSet:
          normalizeText(live.hhSet) ||
          normalizeText(basicPrefilled.hhSet),
        sex:
          normalizeText(live.sex) ||
          normalizeText(basicPrefilled.sex),
        birthday:
          normalizeText(live.birthday) ||
          normalizeText(basicPrefilled.birthday),
        age:
          normalizeText(live.age) ||
          normalizeText(basicPrefilled.age),
        placeOfBirth:
          normalizeText(live.placeOfBirth) ||
          normalizeText(basicEdited.placeOfBirth),
        civilStatus:
          normalizeText(live.civilStatus) ||
          normalizeText(basicPrefilled.civilStatus),
        presentAddress:
          normalizeText(live.presentAddress) ||
          normalizeText(basicEdited.presentAddress),
        educationalAttainment:
          normalizeText(live.educationalAttainment) ||
          normalizeText(basicEdited.educationalAttainment) ||
          normalizeText(basicPrefilled.educationalAttainment),
        contactInfo:
          normalizeContactInfoForDisplay(
            normalizeText(live.contactInfo) ||
            normalizeText(basicEdited.contactInfo)
          ),
        religion:
          normalizeText(live.religion) ||
          normalizeText(basicEdited.religion),
        ipAffiliation:
          normalizeText(live.ipAffiliation) ||
          normalizeText(basicPrefilled.ipAffiliation) ||
          "NONE",
        sourceOfIncome:
          normalizeText(basicEdited.sourceOfIncome) ||
          normalizeText(basicEdited.sourceOfInfo) ||
          normalizeText(live.sourceOfInfo),
        monthlyIncome:
          normalizeText(basicEdited.monthlyIncome),
        perCapitaIncome:
          normalizeText(basicEdited.perCapitaIncome),
        levelOfWellBeing:
          normalizeText(basicEdited.wellBeingLevel) ||
          normalizeText(live.previousWellBeingLevel),
        clientStatusOnExit:
          normalizeText(basicPrefilled.clientStatusOnExit) ||
          normalizeText(live.clientStatusOnExit),
      },
      familyComposition: familyMembers,
      presentingProblem: {
        html: presentingProblemHtml,
      },
      backgroundInformation: {
        tabs: SCSR_BACKGROUND_TABS.map((item) => {
          const entry = getScsrBackgroundTabEntry(item.key);
          return {
            key: item.key,
            label: item.label,
            html: normalizeCaseDevelopmentHtmlForStorage(entry && entry.html),
          };
        }),
      },
      caseAssessment: {
        html: caseAssessmentHtml,
      },
      interventionPlanImplementation: getScsrPlanImplementationItems(),
      caseManagementEvaluation: {
        html: caseManagementEvaluationHtml,
      },
      recommendation: scsrRecommendationDetails,
    };
  }

  function collectBasicInfoForTemplate() {
    const birthdayInputValue = normalizeText(basicBirthdayInput && basicBirthdayInput.value);
    return {
      granteeName: normalizeText(basicGranteeNameInput && basicGranteeNameInput.value),
      householdId: normalizeText(basicHhIdInput && basicHhIdInput.value),
      hhSet: normalizeText(basicHhSetInput && basicHhSetInput.value),
      sex: resolveBasicSexValue(
        normalizeText(basicSexInput && basicSexInput.value)
      ),
      birthday: formatBasicInfoBirthdayForDisplay(birthdayInputValue),
      age: normalizeText(basicAgeInput && basicAgeInput.value) || computeAgeFromBirthday(birthdayInputValue),
      civilStatus: resolveBasicCivilStatusValue(
        normalizeText(basicCivilStatusInput && basicCivilStatusInput.value)
      ),
      ipAffiliation: normalizeText(basicIpAffiliationInput && basicIpAffiliationInput.value),
      clientStatusOnExit: normalizeText(
        basicClientStatusOnExitInput && basicClientStatusOnExitInput.value
      ),
      educationalAttainment: getFieldValue("edit-educational-attainment"),
      contactInfo: getFieldValue("edit-contact-info"),
      nationalId: getFieldValue("edit-national-id"),
      religion: getFieldValue("edit-religion"),
      yearOfRegistration: getFieldValue("edit-year-registration"),
      yearsInProgram: getFieldValue("edit-years-program"),
      presentAddress: getFieldValue("edit-present-address"),
      placeOfBirth: getFieldValue("edit-place-of-birth"),
      sourceOfInfo: getFieldValue("edit-source-of-info"),
      previousWellBeingLevel: getFieldValue("edit-prev-wellbeing"),
    };
  }

  async function getFamilyCompositionMembersForTemplate() {
    let sourceRows = Array.isArray(latestFamilyCompositionRows)
      ? latestFamilyCompositionRows
      : [];
    if (!sourceRows.length) {
      const municipality = normalizeText(
        currentCsrRecord && currentCsrRecord.cardData && currentCsrRecord.cardData.municipality
      ).toUpperCase();
      const hhid = normalizeText(
        currentCsrRecord && currentCsrRecord.cardData && currentCsrRecord.cardData.hhid
      );
      if (municipality && hhid) {
        try {
          const municipalityRows = await loadMunicipalityRecordsForCards(municipality);
          sourceRows = Array.isArray(municipalityRows)
            ? municipalityRows.filter((row) => normalizeText(row && row.HH_ID) === hhid)
            : [];
        } catch (_) {
          sourceRows = [];
        }
      }
    }

    sourceRows = getFamilyCompositionRenderRows(sourceRows);

    const rows = sourceRows
      .slice()
      .sort(
        (a, b) =>
          parseAgeForSort(getFamilyCompositionRowAgeValue(b)) -
          parseAgeForSort(getFamilyCompositionRowAgeValue(a))
      );
    const membersStore = getFamilyCompositionMembersStore();
    const deletedKeys = getFamilyCompositionDeletedKeysStore();

    return rows
      .filter((row) => !deletedKeys.has(getFamilyCompositionMemberKey(row)))
      .map((row) => {
        const memberKey = getFamilyCompositionMemberKey(row);
        const resolvedProfile = isGranteeFamilyCompositionRow(row)
          ? getGranteeFamilyCompositionDisplayDetails(row)
          : getNonGranteeFamilyCompositionDisplayDetails(row);
        return {
          name: normalizeText(resolvedProfile && resolvedProfile.name),
          sex: normalizeText(resolvedProfile && resolvedProfile.sex),
          birthday: getMemberFieldValue(
            membersStore,
            memberKey,
            "birthday",
            formatFamilyCompositionBirthdayValue(
              (resolvedProfile && resolvedProfile.birthday) || row && row.BIRTHDAY
            )
          ),
          age: normalizeText(
            isGranteeFamilyCompositionRow(row)
              ? normalizeText(collectBasicInfoForTemplate().age) || getFamilyCompositionRowAgeValue(row)
              : getFamilyCompositionResolvedMemberProfile(row).age
          ),
          civilStatus: normalizeText(resolvedProfile && resolvedProfile.civilStatus),
          relationship: normalizeText(resolvedProfile && resolvedProfile.relationship),
          monitoredChild: getMemberFieldValue(
            membersStore,
            memberKey,
            "monitoredChild",
            resolveMonitoredChildDefault(row)
          ),
          educationalAttainment: getMemberFieldValue(
            membersStore,
            memberKey,
            "educationalAttainment",
            row && row.GRADE_LEVEL
          ),
          occupation: getMemberFieldValue(
            membersStore,
            memberKey,
            "occupation",
            row && row.OCCUPATION
          ),
          monthlyIncome: getMemberFieldValue(
            membersStore,
            memberKey,
            "monthlyIncome",
            row && row.MONTHLY_INCOME
          ),
          disabilityType: getMemberFieldValue(
            membersStore,
            memberKey,
            "typeOfDisability",
            normalizeText(row && row.DISABILITY_TYPES) || "None"
          ),
        };
      });
  }

  async function handleFamilyCompositionListClick(event) {
    const editButton = event.target.closest("[data-fc-edit-member]");
    if (editButton) {
      event.preventDefault();
      event.stopPropagation();
      const memberKey = normalizeText(editButton.getAttribute("data-fc-edit-member"));
      if (memberKey) {
        openFamilyCompositionEditMemberModal(memberKey);
      }
      return;
    }
    const deleteButton = event.target.closest("[data-fc-delete-member]");
    if (!deleteButton) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const memberKey = normalizeText(deleteButton.getAttribute("data-fc-delete-member"));
    if (!memberKey) {
      return;
    }
    const isAddedMember = getFamilyCompositionAddedMembersStore().some(
      (member) => getFamilyCompositionMemberKey(member) === memberKey
    );
    const confirmed = await confirmUserAction(
      isAddedMember
        ? "Delete this added member permanently from the Family Composition record?"
        : "Delete this member from the Family Composition view? You can restore later."
    );
    if (!confirmed) {
      return;
    }
    void deleteFamilyCompositionMember(memberKey);
  }

  function handleFamilyCompositionInputChange(event) {
    const target = event.target;
    if (!target || !target.matches("[data-fc-field]")) {
      return;
    }
    const fieldName = normalizeText(target.getAttribute("data-fc-field"));
    if (fieldName === "monthlyIncome") {
      target.value = formatMonthlyIncomeValue(target.value);
    }
    if (fieldName === "birthday") {
      target.value = toFamilyCompositionBirthdayIso(target.value);
    }
    if (fieldName === "educationalAttainment") {
      const memberContainer = target.closest("[data-fc-member-key]");
      const memberKey = normalizeText(
        memberContainer && memberContainer.getAttribute("data-fc-member-key")
      );
      if (memberKey && isGranteeMemberKey(memberKey)) {
        syncGranteeEducationalAttainmentFromFamilyCompositionToBasic(target.value, {
          scheduleAutoSave: true,
        });
      }
    }
    syncScsrPerCapitaIncomeField({ scheduleSave: true });
    scheduleFamilyCompositionAutoSave();
    refreshExportValidationGlow();
  }

  function getFamilyCompositionAccordionExpandedKeys() {
    const familyComposition =
      currentCsrRecord &&
      currentCsrRecord.familyComposition &&
      typeof currentCsrRecord.familyComposition === "object"
        ? currentCsrRecord.familyComposition
        : null;
    const ui =
      familyComposition && familyComposition.ui && typeof familyComposition.ui === "object"
        ? familyComposition.ui
        : null;
    const expandedKeys = Array.isArray(ui && ui.expandedMemberKeys)
      ? ui.expandedMemberKeys
      : [];
    return expandedKeys.map((value) => normalizeText(value)).filter(Boolean);
  }

  function setFamilyCompositionAccordionExpandedKeys(expandedKeys) {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return false;
    }
    const nextExpandedKeys = Array.from(
      new Set(
        (Array.isArray(expandedKeys) ? expandedKeys : [])
          .map((value) => normalizeText(value))
          .filter(Boolean)
      )
    );
    const familyComposition =
      currentCsrRecord.familyComposition && typeof currentCsrRecord.familyComposition === "object"
        ? currentCsrRecord.familyComposition
        : {};
    const currentExpandedKeys = getFamilyCompositionAccordionExpandedKeys();
    if (
      currentExpandedKeys.length === nextExpandedKeys.length &&
      currentExpandedKeys.every((value, index) => value === nextExpandedKeys[index])
    ) {
      return false;
    }
    currentCsrRecord.familyComposition = {
      ...familyComposition,
      ui: {
        ...(familyComposition.ui && typeof familyComposition.ui === "object"
          ? familyComposition.ui
          : {}),
        expandedMemberKeys: nextExpandedKeys,
      },
    };
    return true;
  }

  function scheduleFamilyCompositionAccordionStateSave() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    if (familyCompositionAccordionStateSaveTimer) {
      window.clearTimeout(familyCompositionAccordionStateSaveTimer);
    }
    familyCompositionAccordionStateSaveTimer = window.setTimeout(() => {
      familyCompositionAccordionStateSaveTimer = null;
      void persistCsrRecord(currentCsrRecord);
    }, 250);
  }

  function handleFamilyCompositionAccordionToggle(event) {
    const accordion = event.target;
    if (
      !(accordion instanceof window.HTMLDetailsElement) ||
      !accordion.matches("[data-fc-accordion]")
    ) {
      return;
    }
    const memberKey = normalizeText(accordion.getAttribute("data-fc-member-key"));
    if (!memberKey) {
      return;
    }
    const expandedKeys = new Set(getFamilyCompositionAccordionExpandedKeys());
    if (accordion.open) {
      expandedKeys.add(memberKey);
    } else {
      expandedKeys.delete(memberKey);
    }
    const changed = setFamilyCompositionAccordionExpandedKeys(Array.from(expandedKeys));
    if (changed) {
      scheduleFamilyCompositionAccordionStateSave();
    }
  }

  function scheduleFamilyCompositionAutoSave() {
    if (!isActiveFamilyCompositionRecord()) {
      return;
    }
    if (familyCompositionAutoSaveTimer) {
      window.clearTimeout(familyCompositionAutoSaveTimer);
      familyCompositionAutoSaveTimer = null;
    }
    setFamilyCompositionSaveStatus("Saving changes...", "pending");
    familyCompositionAutoSaveTimer = window.setTimeout(() => {
      familyCompositionAutoSaveTimer = null;
      void persistFamilyCompositionEdits({ isAutoSave: true });
    }, FAMILY_COMPOSITION_AUTOSAVE_DELAY_MS);
  }

  function flushFamilyCompositionAutoSave() {
    if (!isActiveFamilyCompositionRecord()) {
      if (familyCompositionAutoSaveTimer) {
        window.clearTimeout(familyCompositionAutoSaveTimer);
        familyCompositionAutoSaveTimer = null;
      }
      if (familyCompositionAccordionStateSaveTimer) {
        window.clearTimeout(familyCompositionAccordionStateSaveTimer);
        familyCompositionAccordionStateSaveTimer = null;
      }
      return;
    }
    if (familyCompositionAutoSaveTimer) {
      window.clearTimeout(familyCompositionAutoSaveTimer);
      familyCompositionAutoSaveTimer = null;
      void persistFamilyCompositionEdits({ isAutoSave: true });
    }
    if (familyCompositionAccordionStateSaveTimer) {
      window.clearTimeout(familyCompositionAccordionStateSaveTimer);
      familyCompositionAccordionStateSaveTimer = null;
      void persistCsrRecord(currentCsrRecord);
    }
  }

  function sanitizeCaseDevelopmentPastedHtml(value) {
    const raw = String(value || "").trim();
    if (!raw || typeof document === "undefined") {
      return "";
    }
    try {
      const container = document.createElement("div");
      container.innerHTML = raw;
      const cleanNarrativeMarkupTree = (root) => {
        if (!root || !root.querySelectorAll) {
          return;
        }
        Array.from(root.querySelectorAll("*")).forEach((node) => {
          const className = String(node.getAttribute("class") || "");
          if (className) {
            const keptClasses = className
              .split(/\s+/)
              .map((item) => item.trim())
              .filter(Boolean)
              .filter((item) => !/^mso/i.test(item));
            if (keptClasses.length) {
              node.setAttribute("class", keptClasses.join(" "));
            } else {
              node.removeAttribute("class");
            }
          }
          const langValue = String(node.getAttribute("lang") || "");
          if (langValue) {
            node.removeAttribute("lang");
          }
          const styleValue = String(node.getAttribute("style") || "");
          if (styleValue) {
            const filtered = styleValue
              .split(";")
              .map((rule) => String(rule || "").trim())
              .filter(Boolean)
              .filter((rule) => !/^--/i.test(rule))
              .filter((rule) => !/^\s*mso-/i.test(rule))
              .filter((rule) => !/^\s*font-family\s*:/i.test(rule))
              .filter((rule) => !/^\s*font-size\s*:/i.test(rule))
              .filter((rule) => !/^\s*line-height\s*:/i.test(rule))
              .filter((rule) => !/^\s*text-indent\s*:/i.test(rule))
              .filter((rule) => !/^\s*letter-spacing\s*:/i.test(rule))
              .filter((rule) => !/^\s*word-spacing\s*:/i.test(rule))
              .filter((rule) => !/^\s*margin-left\s*:/i.test(rule))
              .filter((rule) => !/^\s*padding-left\s*:/i.test(rule))
              .filter((rule) => !/^\s*margin\s*:/i.test(rule))
              .filter((rule) => !/^\s*margin-top\s*:/i.test(rule))
              .filter((rule) => !/^\s*margin-bottom\s*:/i.test(rule))
              .filter((rule) => !/^\s*padding-top\s*:/i.test(rule))
              .filter((rule) => !/^\s*padding-bottom\s*:/i.test(rule))
              .join("; ");
            if (filtered) {
              node.setAttribute("style", filtered);
            } else {
              node.removeAttribute("style");
            }
          }
        });
        Array.from(root.querySelectorAll("span, div")).forEach((node) => {
          const tag = String(node.tagName || "").toUpperCase();
          const hasAttrs = node.attributes && node.attributes.length > 0;
          const children = Array.from(node.childNodes || []);
          const hasBlockChild = children.some(
            (child) =>
              child.nodeType === 1 &&
              /^(P|DIV|SECTION|ARTICLE|UL|OL|LI|TABLE|TBODY|THEAD|TR|TD|TH)$/i.test(
                String(child.tagName || "")
              )
          );
          if (tag === "SPAN" && !hasAttrs) {
            const fragment = document.createDocumentFragment();
            while (node.firstChild) {
              fragment.appendChild(node.firstChild);
            }
            node.replaceWith(fragment);
            return;
          }
          if (tag === "DIV" && !hasAttrs && !hasBlockChild) {
            const paragraph = document.createElement("p");
            while (node.firstChild) {
              paragraph.appendChild(node.firstChild);
            }
            node.replaceWith(paragraph);
          }
        });
      };
      container
        .querySelectorAll("script,style,iframe,object,embed,svg,math,meta,link")
        .forEach((node) => node.remove());
      Array.from(container.querySelectorAll("font")).forEach((fontNode) => {
        const fragment = document.createDocumentFragment();
        while (fontNode.firstChild) {
          fragment.appendChild(fontNode.firstChild);
        }
        fontNode.replaceWith(fragment);
      });
      cleanNarrativeMarkupTree(container);

      Array.from(container.querySelectorAll("*")).forEach((node) => {
        Array.from(node.attributes || []).forEach((attr) => {
          const name = String(attr.name || "").toLowerCase();
          const val = String(attr.value || "");
          if (name.startsWith("on")) {
            node.removeAttribute(attr.name);
            return;
          }
          if (
            (name === "href" || name === "src" || name === "xlink:href") &&
            /^\s*javascript:/i.test(val)
          ) {
            node.removeAttribute(attr.name);
          }
        });
        const styleValue = String(node.getAttribute("style") || "");
        if (styleValue) {
          const filtered = styleValue
            .split(";")
            .map((rule) => String(rule || "").trim())
            .filter(Boolean)
            .filter((rule) => !/^\s*font-family\s*:/i.test(rule))
            .filter((rule) => !/^\s*font-size\s*:/i.test(rule))
            .filter((rule) => !/^\s*line-height\s*:/i.test(rule))
            .filter((rule) => !/^\s*text-indent\s*:/i.test(rule))
            .filter((rule) => !/^\s*letter-spacing\s*:/i.test(rule))
            .filter((rule) => !/^\s*word-spacing\s*:/i.test(rule))
            .filter((rule) => !/^\s*margin-left\s*:/i.test(rule))
            .filter((rule) => !/^\s*padding-left\s*:/i.test(rule))
            .filter((rule) => !/^\s*margin\s*:/i.test(rule))
            .filter((rule) => !/^\s*margin-top\s*:/i.test(rule))
            .filter((rule) => !/^\s*margin-bottom\s*:/i.test(rule))
            .filter((rule) => !/^\s*padding-top\s*:/i.test(rule))
            .filter((rule) => !/^\s*padding-bottom\s*:/i.test(rule))
            .join("; ");
          if (filtered) {
            node.setAttribute("style", filtered);
          } else {
            node.removeAttribute("style");
          }
        }
      });

      const isEmptyNode = (node) => {
        if (!node) {
          return true;
        }
        if (node.nodeType === 3) {
          return !String(node.textContent || "").replace(/\u00A0/g, " ").trim();
        }
        if (node.nodeType !== 1) {
          return true;
        }
        const tag = String(node.tagName || "").toUpperCase();
        if (tag === "BR") {
          return true;
        }
        const text = String(node.textContent || "").replace(/\u00A0/g, " ").trim();
        if (text) {
          return false;
        }
        const children = Array.from(node.childNodes || []);
        if (!children.length) {
          return true;
        }
        return children.every((child) => isEmptyNode(child));
      };

      while (container.firstChild && isEmptyNode(container.firstChild)) {
        container.removeChild(container.firstChild);
      }
      while (container.lastChild && isEmptyNode(container.lastChild)) {
        container.removeChild(container.lastChild);
      }

      return String(container.innerHTML || "").trim();
    } catch (_) {
      return "";
    }
  }

  function normalizeCaseDevelopmentHtmlForStorage(value) {
    const raw = String(value || "");
    if (!raw.trim()) {
      return "";
    }

    const fallbackNormalize = (html) => {
      const compactRaw = html.replace(/\s+/g, "").toLowerCase();
      if (
        compactRaw === "<p><br></p>" ||
        compactRaw === "<p></p>" ||
        compactRaw === "<br>"
      ) {
        return "";
      }
      const textOnly = html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/\u200B/g, "")
        .trim();
      return textOnly ? html.trim() : "";
    };

    if (typeof document === "undefined") {
      return fallbackNormalize(raw);
    }

    try {
      const container = document.createElement("div");
      container.innerHTML = raw;
      const cleanNarrativeMarkupTree = (root) => {
        if (!root || !root.querySelectorAll) {
          return;
        }
        Array.from(root.querySelectorAll("*")).forEach((node) => {
          const className = String(node.getAttribute("class") || "");
          if (className) {
            const keptClasses = className
              .split(/\s+/)
              .map((item) => item.trim())
              .filter(Boolean)
              .filter((item) => !/^mso/i.test(item));
            if (keptClasses.length) {
              node.setAttribute("class", keptClasses.join(" "));
            } else {
              node.removeAttribute("class");
            }
          }
          if (node.hasAttribute("lang")) {
            node.removeAttribute("lang");
          }
          const styleValue = String(node.getAttribute("style") || "");
          if (styleValue) {
            const filtered = styleValue
              .split(";")
              .map((rule) => String(rule || "").trim())
              .filter(Boolean)
              .filter((rule) => !/^--/i.test(rule))
              .filter((rule) => !/^\s*mso-/i.test(rule))
              .filter((rule) => !/^\s*font-family\s*:/i.test(rule))
              .filter((rule) => !/^\s*font-size\s*:/i.test(rule))
              .filter((rule) => !/^\s*line-height\s*:/i.test(rule))
              .filter((rule) => !/^\s*text-indent\s*:/i.test(rule))
              .filter((rule) => !/^\s*margin-left\s*:/i.test(rule))
              .filter((rule) => !/^\s*padding-left\s*:/i.test(rule))
              .filter((rule) => !/^\s*letter-spacing\s*:/i.test(rule))
              .filter((rule) => !/^\s*word-spacing\s*:/i.test(rule))
              .join("; ");
            if (filtered) {
              node.setAttribute("style", filtered);
            } else {
              node.removeAttribute("style");
            }
          }
        });
        Array.from(root.querySelectorAll("span, div")).forEach((node) => {
          const tag = String(node.tagName || "").toUpperCase();
          const hasAttrs = node.attributes && node.attributes.length > 0;
          const children = Array.from(node.childNodes || []);
          const hasBlockChild = children.some(
            (child) =>
              child.nodeType === 1 &&
              /^(P|DIV|SECTION|ARTICLE|UL|OL|LI|TABLE|TBODY|THEAD|TR|TD|TH)$/i.test(
                String(child.tagName || "")
              )
          );
          if (tag === "SPAN" && !hasAttrs) {
            const fragment = document.createDocumentFragment();
            while (node.firstChild) {
              fragment.appendChild(node.firstChild);
            }
            node.replaceWith(fragment);
            return;
          }
          if (tag === "DIV" && !hasAttrs && !hasBlockChild) {
            const paragraph = document.createElement("p");
            while (node.firstChild) {
              paragraph.appendChild(node.firstChild);
            }
            node.replaceWith(paragraph);
          }
        });
      };

      // Enforce consistent typography by removing inline font overrides
      // that can survive paste/clear-format operations.
      Array.from(container.querySelectorAll("font")).forEach((fontNode) => {
        const fragment = document.createDocumentFragment();
        while (fontNode.firstChild) {
          fragment.appendChild(fontNode.firstChild);
        }
        fontNode.replaceWith(fragment);
      });
      cleanNarrativeMarkupTree(container);
      Array.from(container.querySelectorAll("*")).forEach((el) => {
        const styleValue = String(el.getAttribute("style") || "");
        if (!styleValue) {
          return;
        }
        const filtered = styleValue
          .split(";")
          .map((rule) => String(rule || "").trim())
          .filter(Boolean)
          .filter((rule) => !/^\s*font-family\s*:/i.test(rule))
          .filter((rule) => !/^\s*font-size\s*:/i.test(rule))
          .filter((rule) => !/^\s*line-height\s*:/i.test(rule))
          .filter((rule) => !/^\s*text-indent\s*:/i.test(rule))
          .filter((rule) => !/^\s*margin-left\s*:/i.test(rule))
          .filter((rule) => !/^\s*padding-left\s*:/i.test(rule))
          .join("; ");
        if (filtered) {
          el.setAttribute("style", filtered);
        } else {
          el.removeAttribute("style");
        }
      });

      const trimLeadingIndentWhitespace = (node) => {
        if (!node || !node.childNodes || node.childNodes.length === 0) {
          return;
        }
        let cursor = node.firstChild;
        while (cursor) {
          if (cursor.nodeType === 3) {
            const rawText = String(cursor.textContent || "");
            const trimmedText = rawText.replace(/^[\u00A0\s]+/, "");
            if (!trimmedText) {
              const next = cursor.nextSibling;
              cursor.remove();
              cursor = next;
              continue;
            }
            if (trimmedText !== rawText) {
              cursor.textContent = trimmedText;
            }
            return;
          }
          if (cursor.nodeType === 1) {
            trimLeadingIndentWhitespace(cursor);
            const hasVisibleText =
              String(cursor.textContent || "").replace(/[\u00A0\s]+/g, "").length > 0;
            if (hasVisibleText) {
              return;
            }
            cursor = cursor.nextSibling;
            continue;
          }
          cursor = cursor.nextSibling;
        }
      };
      Array.from(container.querySelectorAll("p, li")).forEach((el) => {
        trimLeadingIndentWhitespace(el);
      });

      const isTrailingEmptyNode = (node) => {
        if (!node) {
          return true;
        }
        if (node.nodeType === 3) {
          return !String(node.textContent || "").replace(/[\u00A0\s]+/g, "");
        }
        if (node.nodeType !== 1) {
          return true;
        }
        const tag = String(node.tagName || "").toUpperCase();
        if (tag === "BR") {
          return true;
        }
        const children = Array.from(node.childNodes || []);
        if (!children.length) {
          return !String(node.textContent || "").replace(/[\u00A0\s]+/g, "");
        }
        return children.every((child) => isTrailingEmptyNode(child));
      };

      const trimTrailingLineBreaks = (node) => {
        if (!node || !node.childNodes || node.childNodes.length === 0) {
          return;
        }
        let cursor = node.lastChild;
        while (cursor) {
          if (cursor.nodeType === 3) {
            const rawText = String(cursor.textContent || "");
            const trimmedText = rawText.replace(/[\u00A0\s]+$/, "");
            if (!trimmedText) {
              const previous = cursor.previousSibling;
              cursor.remove();
              cursor = previous;
              continue;
            }
            if (trimmedText !== rawText) {
              cursor.textContent = trimmedText;
            }
            break;
          }
          if (isTrailingEmptyNode(cursor)) {
            const previous = cursor.previousSibling;
            cursor.remove();
            cursor = previous;
            continue;
          }
          if (cursor.nodeType === 1) {
            trimTrailingLineBreaks(cursor);
            if (isTrailingEmptyNode(cursor)) {
              const previous = cursor.previousSibling;
              cursor.remove();
              cursor = previous;
              continue;
            }
          }
          break;
        }
      };
      Array.from(container.querySelectorAll("p, li, div")).forEach((el) => {
        trimTrailingLineBreaks(el);
      });

      const collapseConsecutiveLineBreaks = (node) => {
        if (!node || !node.childNodes || node.childNodes.length === 0) {
          return;
        }
        let previousWasBreak = false;
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === 1) {
            collapseConsecutiveLineBreaks(child);
          }
          const isBreak =
            child.nodeType === 1 &&
            String(child.tagName || "").toUpperCase() === "BR";
          if (isBreak && previousWasBreak) {
            child.remove();
            return;
          }
          previousWasBreak = isBreak;
          if (!isBreak) {
            previousWasBreak = false;
          }
        });
      };
      Array.from(container.querySelectorAll("p, li, div")).forEach((el) => {
        collapseConsecutiveLineBreaks(el);
      });

      const isSimpleInlineParagraph = (node) => {
        if (!node || node.nodeType !== 1 || String(node.tagName || "").toUpperCase() !== "P") {
          return false;
        }
        return Array.from(node.children || []).every((child) => {
          const tag = String(child.tagName || "").toUpperCase();
          return tag === "BR" || tag === "SPAN" || tag === "STRONG" || tag === "B" ||
            tag === "EM" || tag === "I" || tag === "U" || tag === "S" || tag === "A";
        });
      };

      const mergeAdjacentSimpleParagraphs = (root) => {
        if (!root || !root.childNodes || root.childNodes.length === 0) {
          return;
        }
        const isSemanticallyEmptyParagraph = (node) => {
          if (!node || node.nodeType !== 1 || String(node.tagName || "").toUpperCase() !== "P") {
            return false;
          }
          const text = String(node.textContent || "")
            .replace(/\u00A0/g, " ")
            .replace(/\u200B/g, "")
            .trim();
          return text.length === 0;
        };
        const isIgnorableGapNode = (node) => {
          if (!node) {
            return true;
          }
          if (node.nodeType !== 3) {
            return false;
          }
          return !String(node.textContent || "").replace(/[\u00A0\s]+/g, "");
        };
        let cursor = root.firstChild;
        while (cursor) {
          if (cursor.nodeType === 1) {
            mergeAdjacentSimpleParagraphs(cursor);
          }
          const current = cursor;
          let next = current && current.nextSibling;
          while (next && isIgnorableGapNode(next)) {
            const removableGap = next;
            next = next.nextSibling;
            removableGap.remove();
          }
          if (
            isSimpleInlineParagraph(current) &&
            next &&
            isSimpleInlineParagraph(next)
          ) {
            if (isSemanticallyEmptyParagraph(next)) {
              next.remove();
              continue;
            }
            current.appendChild(document.createElement("br"));
            while (next.firstChild) {
              current.appendChild(next.firstChild);
            }
            next.remove();
            continue;
          }
          cursor = current && current.nextSibling;
        }
      };
      const activeWorkflow = normalizeWorkflowType(getActiveRecordWorkflowType());
      if (activeWorkflow === "CSR") {
        mergeAdjacentSimpleParagraphs(container);
      }
      const isEmptyNode = (node) => {
        if (!node) {
          return true;
        }
        if (node.nodeType === 3) {
          return !String(node.textContent || "")
            .replace(/\u00A0/g, " ")
            .replace(/\u200B/g, "")
            .trim();
        }
        if (node.nodeType !== 1) {
          return true;
        }
        const el = node;
        const tag = String(el.tagName || "").toUpperCase();
        if (tag === "BR") {
          return true;
        }
        const textContent = String(el.textContent || "")
          .replace(/\u00A0/g, " ")
          .replace(/\u200B/g, "")
          .trim();
        if (textContent) {
          return false;
        }
        const children = Array.from(el.childNodes || []);
        if (!children.length) {
          return true;
        }
        return children.every((child) => isEmptyNode(child));
      };

      while (container.firstChild && isEmptyNode(container.firstChild)) {
        container.removeChild(container.firstChild);
      }
      while (container.lastChild && isEmptyNode(container.lastChild)) {
        container.removeChild(container.lastChild);
      }
      Array.from(container.querySelectorAll("p, li, div")).forEach((el) => {
        if (el !== container && isEmptyNode(el)) {
          el.remove();
        }
      });

      const normalizedHtml = String(container.innerHTML || "").trim();
      return fallbackNormalize(normalizedHtml);
    } catch (_) {
      return fallbackNormalize(raw);
    }
  }

  function getCaseDevelopmentEditorHtml() {
    if (
      !caseDevelopmentSummernoteReady ||
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.summernote
    ) {
      return "";
    }
    return normalizeCaseDevelopmentHtmlForStorage(
      window.jQuery("#summernote").summernote("code")
    );
  }

  function setCaseDevelopmentEditorHtml(value) {
    if (
      !caseDevelopmentSummernoteReady ||
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.summernote
    ) {
      return;
    }
    caseDevelopmentApplyingEditorValue = true;
    try {
      const html = normalizeCaseDevelopmentHtmlForStorage(value);
      window.jQuery("#summernote").summernote("code", html || "");
    } finally {
      caseDevelopmentApplyingEditorValue = false;
    }
  }

  function getScsrPresentingProblemEditorHtml() {
    return getCaseDevelopmentEditorHtml();
  }

  function setScsrPresentingProblemEditorHtml(value) {
    setCaseDevelopmentEditorHtml(value);
  }

  function getScsrBackgroundEditorHtml() {
    if (
      !scsrBackgroundSummernoteReady ||
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.summernote
    ) {
      return "";
    }
    return normalizeCaseDevelopmentHtmlForStorage(
      window.jQuery("#scsr-background-summernote").summernote("code")
    );
  }

  function setScsrBackgroundEditorHtml(value) {
    if (
      !scsrBackgroundSummernoteReady ||
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.summernote
    ) {
      return;
    }
    scsrBackgroundApplyingEditorValue = true;
    try {
      const html = normalizeCaseDevelopmentHtmlForStorage(value);
      window.jQuery("#scsr-background-summernote").summernote("code", html || "");
    } finally {
      scsrBackgroundApplyingEditorValue = false;
    }
  }

  function scheduleScsrBackgroundAutoSave() {
    if (
      scsrBackgroundApplyingEditorValue ||
      !scsrBackgroundSummernoteReady ||
      !isActiveScsrBackgroundRecord()
    ) {
      return;
    }
    if (scsrBackgroundAutoSaveTimer) {
      window.clearTimeout(scsrBackgroundAutoSaveTimer);
      scsrBackgroundAutoSaveTimer = null;
    }
    setScsrBackgroundSaveStatus("Saving changes...", "pending");
    scsrBackgroundAutoSaveTimer = window.setTimeout(() => {
      scsrBackgroundAutoSaveTimer = null;
      void persistScsrBackgroundDetails({ isAutoSave: true, showToastOnError: false });
    }, SCSR_BACKGROUND_AUTOSAVE_DELAY_MS);
  }

  function flushScsrBackgroundAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (!isActiveScsrBackgroundRecord()) {
      if (scsrBackgroundAutoSaveTimer) {
        window.clearTimeout(scsrBackgroundAutoSaveTimer);
        scsrBackgroundAutoSaveTimer = null;
      }
      return;
    }
    if (scsrBackgroundAutoSaveTimer) {
      window.clearTimeout(scsrBackgroundAutoSaveTimer);
      scsrBackgroundAutoSaveTimer = null;
      void persistScsrBackgroundDetails({ isAutoSave: true, showToastOnError: false });
      return;
    }
    if (shouldForcePersist) {
      void persistScsrBackgroundDetails({ isAutoSave: true, showToastOnError: false });
    }
  }

  function getScsrCaseAssessmentEditorHtml() {
    if (
      !scsrCaseAssessmentSummernoteReady ||
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.summernote
    ) {
      return "";
    }
    return normalizeCaseDevelopmentHtmlForStorage(
      window.jQuery("#scsr-case-assessment-summernote").summernote("code")
    );
  }

  function setScsrCaseAssessmentEditorHtml(value) {
    if (
      !scsrCaseAssessmentSummernoteReady ||
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.summernote
    ) {
      return;
    }
    scsrCaseAssessmentApplyingEditorValue = true;
    try {
      const html = normalizeCaseDevelopmentHtmlForStorage(value);
      window.jQuery("#scsr-case-assessment-summernote").summernote("code", html || "");
    } finally {
      scsrCaseAssessmentApplyingEditorValue = false;
    }
  }

  function scheduleScsrCaseAssessmentAutoSave() {
    if (
      scsrCaseAssessmentApplyingEditorValue ||
      !scsrCaseAssessmentSummernoteReady ||
      !isActiveScsrCaseAssessmentRecord()
    ) {
      return;
    }
    if (scsrCaseAssessmentAutoSaveTimer) {
      window.clearTimeout(scsrCaseAssessmentAutoSaveTimer);
      scsrCaseAssessmentAutoSaveTimer = null;
    }
    setScsrCaseAssessmentSaveStatus("Saving changes...", "pending");
    scsrCaseAssessmentAutoSaveTimer = window.setTimeout(() => {
      scsrCaseAssessmentAutoSaveTimer = null;
      void persistScsrCaseAssessmentDetails({ isAutoSave: true, showToastOnError: false });
    }, CASE_DEVELOPMENT_AUTOSAVE_DELAY_MS);
  }

  function flushScsrCaseAssessmentAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (!isActiveScsrCaseAssessmentRecord()) {
      if (scsrCaseAssessmentAutoSaveTimer) {
        window.clearTimeout(scsrCaseAssessmentAutoSaveTimer);
        scsrCaseAssessmentAutoSaveTimer = null;
      }
      return;
    }
    if (scsrCaseAssessmentAutoSaveTimer) {
      window.clearTimeout(scsrCaseAssessmentAutoSaveTimer);
      scsrCaseAssessmentAutoSaveTimer = null;
      void persistScsrCaseAssessmentDetails({ isAutoSave: true, showToastOnError: false });
      return;
    }
    if (shouldForcePersist) {
      void persistScsrCaseAssessmentDetails({ isAutoSave: true, showToastOnError: false });
    }
  }

  function getScsrCaseManagementEvaluationEditorHtml() {
    if (
      !scsrCaseManagementEvaluationSummernoteReady ||
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.summernote
    ) {
      return "";
    }
    return normalizeCaseDevelopmentHtmlForStorage(
      window.jQuery("#scsr-case-management-evaluation-summernote").summernote("code")
    );
  }

  function setScsrCaseManagementEvaluationEditorHtml(value) {
    if (
      !scsrCaseManagementEvaluationSummernoteReady ||
      typeof window.jQuery === "undefined" ||
      !window.jQuery.fn ||
      !window.jQuery.fn.summernote
    ) {
      return;
    }
    scsrCaseManagementEvaluationApplyingEditorValue = true;
    try {
      const html = normalizeCaseDevelopmentHtmlForStorage(value);
      window.jQuery("#scsr-case-management-evaluation-summernote").summernote("code", html || "");
    } finally {
      scsrCaseManagementEvaluationApplyingEditorValue = false;
    }
  }

  function normalizeActiveNarrativeEditorForStep(step, workflowType) {
    const normalizedWorkflow = normalizeWorkflowType(workflowType);
    if (step === 3) {
      setCaseDevelopmentEditorHtml(getCaseDevelopmentEditorHtml());
      return;
    }
    if (normalizedWorkflow !== "SCSR") {
      return;
    }
    if (step === 4) {
      setScsrBackgroundEditorHtml(getScsrBackgroundEditorHtml());
      return;
    }
    if (step === 5) {
      setScsrCaseAssessmentEditorHtml(getScsrCaseAssessmentEditorHtml());
      return;
    }
    if (step === 7) {
      setScsrCaseManagementEvaluationEditorHtml(getScsrCaseManagementEvaluationEditorHtml());
    }
  }

  function scheduleScsrCaseManagementEvaluationAutoSave() {
    if (
      scsrCaseManagementEvaluationApplyingEditorValue ||
      !scsrCaseManagementEvaluationSummernoteReady ||
      !isActiveScsrCaseManagementEvaluationRecord()
    ) {
      return;
    }
    if (scsrCaseManagementEvaluationAutoSaveTimer) {
      window.clearTimeout(scsrCaseManagementEvaluationAutoSaveTimer);
      scsrCaseManagementEvaluationAutoSaveTimer = null;
    }
    setScsrCaseManagementEvaluationSaveStatus("Saving changes...", "pending");
    scsrCaseManagementEvaluationAutoSaveTimer = window.setTimeout(() => {
      scsrCaseManagementEvaluationAutoSaveTimer = null;
      void persistScsrCaseManagementEvaluationDetails({ isAutoSave: true, showToastOnError: false });
    }, CASE_DEVELOPMENT_AUTOSAVE_DELAY_MS);
  }

  function flushScsrCaseManagementEvaluationAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (!isActiveScsrCaseManagementEvaluationRecord()) {
      if (scsrCaseManagementEvaluationAutoSaveTimer) {
        window.clearTimeout(scsrCaseManagementEvaluationAutoSaveTimer);
        scsrCaseManagementEvaluationAutoSaveTimer = null;
      }
      return;
    }
    if (scsrCaseManagementEvaluationAutoSaveTimer) {
      window.clearTimeout(scsrCaseManagementEvaluationAutoSaveTimer);
      scsrCaseManagementEvaluationAutoSaveTimer = null;
      void persistScsrCaseManagementEvaluationDetails({ isAutoSave: true, showToastOnError: false });
      return;
    }
    if (shouldForcePersist) {
      void persistScsrCaseManagementEvaluationDetails({ isAutoSave: true, showToastOnError: false });
    }
  }

  function scheduleCaseDevelopmentAutoSave() {
    if (
      caseDevelopmentApplyingEditorValue ||
      !caseDevelopmentSummernoteReady ||
      !currentCsrRecord ||
      !currentCsrRecord.csrId
    ) {
      return;
    }
    if (caseDevelopmentAutoSaveTimer) {
      window.clearTimeout(caseDevelopmentAutoSaveTimer);
      caseDevelopmentAutoSaveTimer = null;
    }
    setCaseDevelopmentSaveStatus("Saving changes...", "pending");
    caseDevelopmentAutoSaveTimer = window.setTimeout(() => {
      caseDevelopmentAutoSaveTimer = null;
      void persistCaseDevelopmentDetails({ isAutoSave: true, showToastOnError: false });
    }, CASE_DEVELOPMENT_AUTOSAVE_DELAY_MS);
  }

  function scheduleScsrPresentingProblemAutoSave() {
    if (
      caseDevelopmentApplyingEditorValue ||
      !caseDevelopmentSummernoteReady ||
      !isActiveScsrPresentingProblemRecord()
    ) {
      return;
    }
    if (scsrPresentingProblemAutoSaveTimer) {
      window.clearTimeout(scsrPresentingProblemAutoSaveTimer);
      scsrPresentingProblemAutoSaveTimer = null;
    }
    setCaseDevelopmentSaveStatus("Saving changes...", "pending");
    scsrPresentingProblemAutoSaveTimer = window.setTimeout(() => {
      scsrPresentingProblemAutoSaveTimer = null;
      void persistScsrPresentingProblemDetails({ isAutoSave: true, showToastOnError: false });
    }, CASE_DEVELOPMENT_AUTOSAVE_DELAY_MS);
  }

  function flushCaseDevelopmentAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (caseDevelopmentAutoSaveTimer) {
      window.clearTimeout(caseDevelopmentAutoSaveTimer);
      caseDevelopmentAutoSaveTimer = null;
      void persistCaseDevelopmentDetails({ isAutoSave: true, showToastOnError: false });
      return;
    }
    if (shouldForcePersist) {
      void persistCaseDevelopmentDetails({ isAutoSave: true, showToastOnError: false });
    }
  }

  function flushScsrPresentingProblemAutoSave(forcePersist) {
    const shouldForcePersist = Boolean(forcePersist);
    if (!isActiveScsrPresentingProblemRecord()) {
      if (scsrPresentingProblemAutoSaveTimer) {
        window.clearTimeout(scsrPresentingProblemAutoSaveTimer);
        scsrPresentingProblemAutoSaveTimer = null;
      }
      return;
    }
    if (scsrPresentingProblemAutoSaveTimer) {
      window.clearTimeout(scsrPresentingProblemAutoSaveTimer);
      scsrPresentingProblemAutoSaveTimer = null;
      void persistScsrPresentingProblemDetails({ isAutoSave: true, showToastOnError: false });
      return;
    }
    if (shouldForcePersist) {
      void persistScsrPresentingProblemDetails({ isAutoSave: true, showToastOnError: false });
    }
  }

  function scheduleActiveNarrativeAutoSave() {
    if (activeWorkflowType === "SCSR") {
      scheduleScsrPresentingProblemAutoSave();
      return;
    }
    scheduleCaseDevelopmentAutoSave();
  }

  function flushActiveNarrativeAutoSave(forcePersist) {
    if (activeWorkflowType === "SCSR") {
      flushScsrPresentingProblemAutoSave(forcePersist);
      return;
    }
    flushCaseDevelopmentAutoSave(forcePersist);
  }

  function scheduleBasicInfoAutoSave() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    if (basicInfoAutoSaveTimer) {
      window.clearTimeout(basicInfoAutoSaveTimer);
      basicInfoAutoSaveTimer = null;
    }
    setBasicInfoSaveStatus("Saving changes...", "pending");
    basicInfoAutoSaveTimer = window.setTimeout(() => {
      basicInfoAutoSaveTimer = null;
      void persistBasicInfoEditDetails({ isAutoSave: true, showToastOnError: false });
    }, BASIC_INFO_AUTOSAVE_DELAY_MS);
  }

  function flushBasicInfoAutoSave() {
    if (basicInfoAutoSaveTimer) {
      window.clearTimeout(basicInfoAutoSaveTimer);
      basicInfoAutoSaveTimer = null;
      void persistBasicInfoEditDetails({ isAutoSave: true, showToastOnError: false });
    }
  }

  function getBasicInfoRequiredFieldIds(workflowType) {
    return normalizeWorkflowType(workflowType || activeWorkflowType) === "SCSR"
      ? SCSR_BASIC_INFO_REQUIRED_FIELD_IDS
      : CSR_BASIC_INFO_REQUIRED_FIELD_IDS;
  }

  function getBasicInfoRequiredFields(workflowType) {
    return getBasicInfoRequiredFieldIds(workflowType)
      .map((fieldId) => document.getElementById(fieldId))
      .filter((field) => Boolean(field));
  }

  function getAllBasicInfoValidationFields() {
    const fieldIds = new Set([
      "basic-sex",
      "basic-civil-status",
      ...CSR_BASIC_INFO_REQUIRED_FIELD_IDS,
      ...SCSR_BASIC_INFO_REQUIRED_FIELD_IDS,
    ]);
    return Array.from(fieldIds)
      .map((fieldId) => document.getElementById(fieldId))
      .filter((field) => Boolean(field));
  }

  function formatSaveTimeLabel(date) {
    try {
      const parsed = new Date(date);
      if (Number.isNaN(parsed.getTime())) {
        return "";
      }
      return parsed.toLocaleTimeString("en-PH", {
        timeZone: "Asia/Manila",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (_) {
      return "";
    }
  }

  function setBasicInfoSaveStatus(message, tone) {
    if (!basicInfoSaveStatus) {
      return;
    }
    basicInfoSaveStatus.textContent = normalizeText(message);
    basicInfoSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      basicInfoSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      basicInfoSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      basicInfoSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    basicInfoSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setFamilyCompositionSaveStatus(message, tone) {
    if (!familyCompositionSaveStatus) {
      return;
    }
    familyCompositionSaveStatus.textContent = normalizeText(message);
    familyCompositionSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      familyCompositionSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      familyCompositionSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      familyCompositionSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    familyCompositionSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setCaseDevelopmentSaveStatus(message, tone) {
    if (!caseDevelopmentSaveStatus) {
      return;
    }
    caseDevelopmentSaveStatus.textContent = normalizeText(message);
    caseDevelopmentSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      caseDevelopmentSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      caseDevelopmentSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      caseDevelopmentSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    caseDevelopmentSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setScsrBackgroundSaveStatus(message, tone) {
    if (!scsrBackgroundSaveStatus) {
      return;
    }
    scsrBackgroundSaveStatus.textContent = normalizeText(message);
    scsrBackgroundSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      scsrBackgroundSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      scsrBackgroundSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      scsrBackgroundSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    scsrBackgroundSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setScsrCaseAssessmentSaveStatus(message, tone) {
    if (!scsrCaseAssessmentSaveStatus) {
      return;
    }
    scsrCaseAssessmentSaveStatus.textContent = normalizeText(message);
    scsrCaseAssessmentSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      scsrCaseAssessmentSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      scsrCaseAssessmentSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      scsrCaseAssessmentSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    scsrCaseAssessmentSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setScsrCaseManagementEvaluationSaveStatus(message, tone) {
    if (!scsrCaseManagementEvaluationSaveStatus) {
      return;
    }
    scsrCaseManagementEvaluationSaveStatus.textContent = normalizeText(message);
    scsrCaseManagementEvaluationSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      scsrCaseManagementEvaluationSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      scsrCaseManagementEvaluationSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      scsrCaseManagementEvaluationSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    scsrCaseManagementEvaluationSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setInterventionsProvidedSaveStatus(message, tone) {
    if (!interventionsProvidedSaveStatus) {
      return;
    }
    interventionsProvidedSaveStatus.textContent = normalizeText(message);
    interventionsProvidedSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      interventionsProvidedSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      interventionsProvidedSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      interventionsProvidedSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    interventionsProvidedSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setScsrPlanImplementationSaveStatus(message, tone) {
    if (!scsrPlanImplementationSaveStatus) {
      return;
    }
    scsrPlanImplementationSaveStatus.textContent = normalizeText(message);
    scsrPlanImplementationSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      scsrPlanImplementationSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      scsrPlanImplementationSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      scsrPlanImplementationSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    scsrPlanImplementationSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setHouseholdInterventionPlanSaveStatus(message, tone) {
    if (!householdInterventionPlanSaveStatus) {
      return;
    }
    householdInterventionPlanSaveStatus.textContent = normalizeText(message);
    householdInterventionPlanSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      householdInterventionPlanSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      householdInterventionPlanSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      householdInterventionPlanSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    householdInterventionPlanSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setRecommendationSaveStatus(message, tone) {
    if (!recommendationSaveStatus) {
      return;
    }
    recommendationSaveStatus.textContent = normalizeText(message);
    recommendationSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      recommendationSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      recommendationSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      recommendationSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    recommendationSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setScsrRecommendationSaveStatus(message, tone) {
    if (!scsrRecommendationSaveStatus) {
      return;
    }
    scsrRecommendationSaveStatus.textContent = normalizeText(message);
    scsrRecommendationSaveStatus.classList.remove(
      "text-slate-500",
      "dark:text-slate-400",
      "text-amber-600",
      "dark:text-amber-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-red-600",
      "dark:text-red-400"
    );
    if (tone === "success") {
      scsrRecommendationSaveStatus.classList.add("text-emerald-600", "dark:text-emerald-400");
      return;
    }
    if (tone === "error") {
      scsrRecommendationSaveStatus.classList.add("text-red-600", "dark:text-red-400");
      return;
    }
    if (tone === "pending") {
      scsrRecommendationSaveStatus.classList.add("text-amber-600", "dark:text-amber-400");
      return;
    }
    scsrRecommendationSaveStatus.classList.add("text-slate-500", "dark:text-slate-400");
  }

  function setModalFieldError(field) {
    if (!field) {
      return;
    }
    field.classList.add(
      "border-red-500",
      "focus:border-red-500",
      "focus:ring-red-500",
      "ring-2",
      "ring-red-300/70",
      "dark:ring-red-800/60"
    );
  }

  function clearModalFieldError(field) {
    if (!field) {
      return;
    }
    field.classList.remove(
      "border-red-500",
      "focus:border-red-500",
      "focus:ring-red-500",
      "ring-2",
      "ring-red-300/70",
      "dark:ring-red-800/60"
    );
  }

  function validateRequiredModalFields(fields) {
    let firstInvalidField = null;
    fields.forEach((field) => {
      if (!field) {
        return;
      }
      if (!normalizeText(field.value)) {
        setModalFieldError(field);
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      } else {
        clearModalFieldError(field);
      }
    });
    return {
      valid: !firstInvalidField,
      firstInvalidField,
    };
  }

  function setBasicInfoFieldError(field) {
    if (!field) {
      return;
    }
    field.classList.add("border-red-500", "focus:border-red-500", "focus:ring-red-500");
  }

  function clearBasicInfoFieldError(field) {
    if (!field) {
      return;
    }
    field.classList.remove("border-red-500", "focus:border-red-500", "focus:ring-red-500");
  }

  function sanitizeBasicInfoNameInputValue(value) {
    return String(value == null ? "" : value)
      .replace(/\d+/g, "")
      .replace(/\s{2,}/g, " ");
  }

  function hasNumericCharacters(value) {
    return /\d/.test(String(value == null ? "" : value));
  }

  function isBasicInfoFieldEmpty(field) {
    const value = normalizeText(field.value);
    if (BASIC_INFO_OPTIONAL_FIELD_IDS.has(field.id) && !value) {
      return false;
    }
    if (!value) {
      return true;
    }
    if (field.tagName === "SELECT") {
      const normalized = value.toUpperCase();
      return normalized.startsWith("SELECT");
    }
    return false;
  }

  function bindBasicInfoFieldConstraints() {
    if (basicBirthdayInput) {
      const todayIso = getPhilippinesTodayIsoDate();
      if (todayIso) {
        basicBirthdayInput.max = todayIso;
      }
    }

    if (basicGranteeNameInput) {
      const syncNameValidationState = () => {
        const invalid = hasNumericCharacters(basicGranteeNameInput.value);
        if (invalid) {
          setBasicInfoFieldError(basicGranteeNameInput);
        } else {
          clearBasicInfoFieldError(basicGranteeNameInput);
        }
      };
      const sanitizeNameField = () => {
        const sanitized = sanitizeBasicInfoNameInputValue(basicGranteeNameInput.value);
        if (basicGranteeNameInput.value !== sanitized) {
          basicGranteeNameInput.value = sanitized;
        }
        syncNameValidationState();
      };
      basicGranteeNameInput.addEventListener("input", sanitizeNameField);
      basicGranteeNameInput.addEventListener("blur", sanitizeNameField);
      sanitizeNameField();
    }

    const contactField = document.getElementById("edit-contact-info");
    if (contactField) {
      if (!normalizeText(contactField.value)) {
        contactField.value = "09";
      }
      const syncContactValidationState = () => {
        const invalid = isContactInfoValueInvalid(contactField.value);
        if (invalid) {
          setBasicInfoFieldError(contactField);
        } else {
          clearBasicInfoFieldError(contactField);
        }
      };
      contactField.addEventListener("input", () => {
        contactField.value = normalizePhilippineMobile(contactField.value);
        syncContactValidationState();
      });
      contactField.addEventListener("focus", () => {
        contactField.value = normalizePhilippineMobile(contactField.value);
        syncContactValidationState();
      });
      contactField.addEventListener("blur", () => {
        contactField.value = normalizePhilippineMobile(contactField.value);
        syncContactValidationState();
      });
      syncContactValidationState();
    }

    const nationalIdField = document.getElementById("edit-national-id");
    if (nationalIdField) {
      const syncNationalIdValidationState = () => {
        const invalid = isNationalIdValueInvalid(nationalIdField.value);
        if (invalid) {
          setBasicInfoFieldError(nationalIdField);
        } else {
          clearBasicInfoFieldError(nationalIdField);
        }
      };
      nationalIdField.addEventListener("input", () => {
        nationalIdField.value = formatNationalId(nationalIdField.value);
        syncNationalIdValidationState();
      });
      nationalIdField.addEventListener("blur", () => {
        nationalIdField.value = formatNationalId(nationalIdField.value);
        syncNationalIdValidationState();
      });
      syncNationalIdValidationState();
    }

    const yearsInProgramField = document.getElementById("edit-years-program");
    if (yearsInProgramField) {
      yearsInProgramField.addEventListener("input", () => {
        yearsInProgramField.value = normalizeText(yearsInProgramField.value)
          .replace(/\D/g, "")
          .slice(0, 2);
      });
    }

    const yearOfRegistrationField = document.getElementById("edit-year-registration");
    if (yearOfRegistrationField) {
      yearOfRegistrationField.addEventListener("input", () => {
        yearOfRegistrationField.value = normalizeText(yearOfRegistrationField.value)
          .replace(/\D/g, "")
          .slice(0, 4);
      });
    }

    const sourceOfInfoField = document.getElementById(SOURCE_OF_INFO_FIELD_ID);
    if (sourceOfInfoField) {
      ["input", "change", "blur"].forEach((eventName) => {
        sourceOfInfoField.addEventListener(eventName, () => {
          refreshBasicInfoDatalistVisibility();
        });
      });
    }

    const prevWellBeingField = document.getElementById(PREV_WELLBEING_FIELD_ID);
    if (prevWellBeingField) {
      ["input", "change", "blur"].forEach((eventName) => {
        prevWellBeingField.addEventListener(eventName, () => {
          refreshBasicInfoDatalistVisibility();
        });
      });
    }

    [monthlyIncomeField, perCapitaIncomeField].forEach((field) => {
      if (!field) {
        return;
      }
      field.addEventListener("input", () => {
        field.value = normalizePesoAmountInput(field.value);
        if (field === monthlyIncomeField) {
          void refreshScsrPerCapitaIncomeFromFamilyComposition();
        }
      });
      field.addEventListener("blur", () => {
        field.value = normalizePesoAmountInput(field.value);
        if (field === monthlyIncomeField) {
          void refreshScsrPerCapitaIncomeFromFamilyComposition();
        }
      });
    });

    refreshBasicInfoDatalistVisibility();
  }

  function syncInputDatalistVisibility(field, datalistId) {
    if (!field) {
      return;
    }
    const hasValue = normalizeText(field.value).length > 0;
    if (hasValue) {
      field.removeAttribute("list");
      return;
    }
    if (datalistId && document.getElementById(datalistId)) {
      field.setAttribute("list", datalistId);
    }
  }

  function refreshBasicInfoDatalistVisibility() {
    const sourceOfInfoField = document.getElementById(SOURCE_OF_INFO_FIELD_ID);
    if (activeWorkflowType === "SCSR") {
      if (sourceOfInfoField) {
        sourceOfInfoField.removeAttribute("list");
      }
    } else {
      syncInputDatalistVisibility(sourceOfInfoField, SOURCE_OF_INFO_DATALIST_ID);
    }

    const prevWellBeingField = document.getElementById(PREV_WELLBEING_FIELD_ID);
    syncInputDatalistVisibility(prevWellBeingField, PREV_WELLBEING_DATALIST_ID);
  }

  function normalizePhilippineMobile(value) {
    const digits = normalizeText(value).replace(/\D/g, "");
    if (!digits) {
      return "09";
    }
    if (digits.startsWith("09")) {
      return digits.slice(0, 11);
    }
    if (digits.startsWith("9")) {
      return (`0${digits}`).slice(0, 11);
    }
    const withoutLeadingZero = digits.replace(/^0+/, "");
    return (`09${withoutLeadingZero}`).slice(0, 11);
  }

  function normalizePesoAmountInput(value) {
    const raw = normalizeText(value).replace(/₱/g, "").replace(/\s+/g, "");
    const cleaned = raw.replace(/[^0-9.,]/g, "");
    const parts = getPesoAmountParts(cleaned);
    if (!parts) {
      return "";
    }
    const { integerDigits, decimalDigits, endsWithSeparator } = parts;
    if (!integerDigits && !decimalDigits) {
      return "";
    }
    const integerNumber = Number.parseInt(integerDigits || "0", 10);
    const formattedInteger = Number.isFinite(integerNumber)
      ? integerNumber.toLocaleString("en-PH")
      : "0";
    if (endsWithSeparator) {
      return `₱${formattedInteger}.`;
    }
    if (decimalDigits) {
      return `₱${formattedInteger}.${decimalDigits}`;
    }
    return `₱${formattedInteger}`;
  }

  function getPesoAmountParts(cleanedValue) {
    const cleaned = normalizeText(cleanedValue).replace(/[^0-9.,]/g, "");
    if (!cleaned) {
      return null;
    }
    const hasDot = cleaned.includes(".");
    const hasComma = cleaned.includes(",");
    const isThousandsGrouping = (separator) => {
      const parts = cleaned.split(separator);
      if (parts.length <= 1) {
        return false;
      }
      const head = parts[0].replace(/\D/g, "");
      if (!head || head.length > 3) {
        return false;
      }
      return parts.slice(1).every((part) => /^\d{3}$/.test(part));
    };

    let separatorIndex = -1;
    let treatAsDecimal = false;
    if (hasDot && hasComma) {
      separatorIndex = Math.max(cleaned.lastIndexOf("."), cleaned.lastIndexOf(","));
      treatAsDecimal = true;
    } else if (hasDot || hasComma) {
      const separator = hasDot ? "." : ",";
      separatorIndex = cleaned.lastIndexOf(separator);
      const digitsAfter = cleaned.length - separatorIndex - 1;
      treatAsDecimal = digitsAfter <= 2 && !isThousandsGrouping(separator);
    }

    if (!treatAsDecimal || separatorIndex < 0) {
      return {
        integerDigits: cleaned.replace(/[.,]/g, ""),
        decimalDigits: "",
        endsWithSeparator: false,
      };
    }

    return {
      integerDigits: cleaned.slice(0, separatorIndex).replace(/[.,]/g, ""),
      decimalDigits: cleaned.slice(separatorIndex + 1).replace(/[.,]/g, "").slice(0, 2),
      endsWithSeparator: separatorIndex === cleaned.length - 1,
    };
  }

  function formatNationalId(value) {
    const digits = normalizeText(value).replace(/\D/g, "").slice(0, 16);
    const chunks = digits.match(/.{1,4}/g);
    return chunks ? chunks.join("-") : "";
  }

  function normalizeContactInfoForStorage(value) {
    const contact = normalizePhilippineMobile(value);
    return /^09\d{9}$/.test(contact) ? contact : "NONE";
  }

  function normalizeContactInfoFromGrantee(value) {
    const raw = normalizeText(value);
    const upper = raw.toUpperCase();
    if (!raw || upper === "NONE" || upper === "N/A") {
      return "";
    }
    const normalized = normalizePhilippineMobile(raw);
    return /^09\d{9}$/.test(normalized) ? normalized : "";
  }

  function isContactInfoValueInvalid(value) {
    const normalized = normalizeText(value);
    if (!normalized || normalized === "09") {
      return false;
    }
    return !/^09\d{9}$/.test(normalized);
  }

  function isNationalIdValueInvalid(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
      return false;
    }
    return !/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(normalized);
  }

  function shouldPrefillContactInfoField(field) {
    if (!field) {
      return false;
    }
    const current = normalizeText(field.value);
    // "09" is our default placeholder-like value; allow prefill to replace it.
    return !current || current === "09";
  }

  function normalizeContactInfoForDisplay(value) {
    const normalized = normalizeContactInfoForStorage(value);
    return normalized === "NONE" ? "None" : normalized;
  }

  function formatYearsInProgramForDisplay(value) {
    const digits = normalizeText(value).replace(/\D/g, "").slice(0, 2);
    if (!digits) {
      return "";
    }
    const numericValue = Number.parseInt(digits, 10);
    if (!Number.isFinite(numericValue)) {
      return "";
    }
    return `${numericValue} ${numericValue === 1 ? "year" : "years"}`;
  }

  function applyPerCapitaIncomeFieldMode(isScsr) {
    if (!perCapitaIncomeField) {
      return;
    }
    perCapitaIncomeField.readOnly = !!isScsr;
    perCapitaIncomeField.setAttribute("aria-disabled", isScsr ? "true" : "false");
    perCapitaIncomeField.tabIndex = isScsr ? -1 : 0;
    perCapitaIncomeField.classList.toggle("bg-slate-100", !!isScsr);
    perCapitaIncomeField.classList.toggle("dark:bg-slate-700", !!isScsr);
    perCapitaIncomeField.classList.toggle("cursor-not-allowed", !!isScsr);
    perCapitaIncomeField.classList.toggle("text-slate-500", !!isScsr);
    perCapitaIncomeField.classList.toggle("dark:text-slate-300", !!isScsr);
  }

  function parsePesoAmountToNumber(value) {
    const raw = normalizeText(value).replace(/₱/g, "").replace(/\s+/g, "");
    const parts = getPesoAmountParts(raw);
    if (!parts) {
      return null;
    }
    const normalized = parts.decimalDigits
      ? `${parts.integerDigits || "0"}.${parts.decimalDigits}`
      : parts.integerDigits;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function formatPesoAmountForDisplay(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return "";
    }
    return `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function getVisibleFamilyCompositionMemberCount() {
    const sourceRows = getFamilyCompositionRenderRows(latestFamilyCompositionRows);
    if (!sourceRows.length) {
      return 0;
    }
    const deletedKeys = getFamilyCompositionDeletedKeysStore();
    return sourceRows.filter((row) => !deletedKeys.has(getFamilyCompositionMemberKey(row))).length;
  }

  function computeScsrPerCapitaIncomeValue(monthlyIncomeValue) {
    const monthlyIncome = parsePesoAmountToNumber(monthlyIncomeValue);
    const memberCount = getVisibleFamilyCompositionMemberCount();
    if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0 || memberCount <= 0) {
      return "";
    }
    return formatPesoAmountForDisplay(monthlyIncome / memberCount);
  }

  function syncScsrPerCapitaIncomeField(options) {
    if (getActiveRecordWorkflowType() !== "SCSR" || !perCapitaIncomeField) {
      return false;
    }
    const config = {
      preserveExistingOnUnresolved: true,
      scheduleSave: false,
      ...options,
    };
    const currentValue = normalizeText(perCapitaIncomeField.value);
    let nextValue = computeScsrPerCapitaIncomeValue(
      monthlyIncomeField && monthlyIncomeField.value
    );
    if (!nextValue && config.preserveExistingOnUnresolved && currentValue) {
      nextValue = currentValue;
    }
    if (normalizeText(nextValue) === currentValue) {
      return false;
    }
    perCapitaIncomeField.value = nextValue;
    if (config.scheduleSave && currentCsrRecord && currentCsrRecord.csrId) {
      scheduleBasicInfoAutoSave();
    }
    return true;
  }

  async function ensureFamilyCompositionRowsForActiveRecord() {
    if (!currentCsrRecord || !currentCsrRecord.cardData) {
      return false;
    }
    if (Array.isArray(latestFamilyCompositionRows) && latestFamilyCompositionRows.length) {
      return true;
    }
    const targetCsrId = String(currentCsrRecord.csrId || "");
    try {
      await populateFamilyCompositionFromSelectedCard(currentCsrRecord.cardData);
    } catch (_) {
      return false;
    }
    return (
      !!currentCsrRecord &&
      String(currentCsrRecord.csrId || "") === targetCsrId &&
      Array.isArray(latestFamilyCompositionRows) &&
      latestFamilyCompositionRows.length > 0
    );
  }

  async function refreshScsrPerCapitaIncomeFromFamilyComposition(options) {
    if (getActiveRecordWorkflowType() !== "SCSR") {
      return false;
    }
    const config = {
      scheduleSave: true,
      preserveExistingOnUnresolved: false,
      ...options,
    };
    const hasRows = await ensureFamilyCompositionRowsForActiveRecord();
    return syncScsrPerCapitaIncomeField({
      scheduleSave: hasRows && config.scheduleSave,
      preserveExistingOnUnresolved: config.preserveExistingOnUnresolved,
    });
  }

  function normalizeNationalIdForStorage(value) {
    const nationalId = formatNationalId(value);
    return /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(nationalId) ? nationalId : "NONE";
  }

  function isReligionOptionAvailable(selectField, value) {
    if (!selectField) {
      return false;
    }
    return Array.from(selectField.options || []).some(
      (option) => normalizeText(option.value) === normalizeText(value)
    );
  }

  function normalizeSelectOptionKey(value) {
    return normalizeText(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "");
  }

  function resolveSelectOptionValue(selectField, value) {
    if (!selectField) {
      return "";
    }
    const raw = normalizeText(value);
    if (!raw) {
      return "";
    }

    const exact = Array.from(selectField.options || []).find(
      (option) => normalizeText(option.value).toUpperCase() === raw.toUpperCase()
    );
    if (exact) {
      return normalizeText(exact.value);
    }

    const normalizedRaw = normalizeSelectOptionKey(raw);
    const normalized = Array.from(selectField.options || []).find(
      (option) => normalizeSelectOptionKey(option.value) === normalizedRaw
    );
    return normalized ? normalizeText(normalized.value) : "";
  }

  function setEducationalAttainmentFieldValue(value, preserveExistingValue) {
    const field = document.getElementById("edit-educational-attainment");
    if (!field) {
      return;
    }
    if (preserveExistingValue && !isBasicInfoFieldEmpty(field) && normalizeText(field.value)) {
      return;
    }

    const matched = resolveSelectOptionValue(field, value);
    if (matched) {
      field.value = matched;
      syncGranteeEducationalAttainmentFromBasicToFamilyComposition({
        scheduleAutoSave: false,
      });
      return;
    }

    const defaultValue = resolveSelectOptionValue(field, "Select Level");
    if (defaultValue) {
      field.value = defaultValue;
      syncGranteeEducationalAttainmentFromBasicToFamilyComposition({
        scheduleAutoSave: false,
      });
      return;
    }

    if ((field.options || []).length) {
      field.selectedIndex = 0;
      syncGranteeEducationalAttainmentFromBasicToFamilyComposition({
        scheduleAutoSave: false,
      });
    }
  }

  function getBasicEducationalAttainmentField() {
    return document.getElementById("edit-educational-attainment");
  }

  function getGranteeFamilyCompositionEducationalAttainmentField() {
    if (!familyCompositionList) {
      return null;
    }
    const memberContainers = Array.from(
      familyCompositionList.querySelectorAll("[data-fc-member-key]")
    );
    for (let index = 0; index < memberContainers.length; index += 1) {
      const container = memberContainers[index];
      const memberKey = normalizeText(container.getAttribute("data-fc-member-key"));
      if (!memberKey || !isGranteeMemberKey(memberKey)) {
        continue;
      }
      const field = container.querySelector('[data-fc-field="educationalAttainment"]');
      if (field) {
        return field;
      }
    }
    return null;
  }

  function resolveFamilyCompositionEducationFieldValue(field, value) {
    if (!field) {
      return "";
    }
    const optionValues = Array.from(field.options || []).map((option) =>
      normalizeText(option.value)
    );
    const matched = resolveFamilyCompositionEducationOption(value, optionValues);
    if (matched) {
      return matched;
    }
    const defaultValue = resolveFamilyCompositionEducationOption("Select Level", optionValues);
    if (defaultValue) {
      return defaultValue;
    }
    return optionValues.length > 0 ? optionValues[0] : "";
  }

  function syncGranteeEducationalAttainmentFromBasicToFamilyComposition(options) {
    if (educationalAttainmentSyncInProgress) {
      return;
    }
    const config = {
      scheduleAutoSave: true,
      ...options,
    };
    const basicField = getBasicEducationalAttainmentField();
    const familyField = getGranteeFamilyCompositionEducationalAttainmentField();
    if (!basicField || !familyField) {
      return;
    }
    const resolved = resolveFamilyCompositionEducationFieldValue(familyField, basicField.value);
    if (!resolved || normalizeText(familyField.value) === normalizeText(resolved)) {
      return;
    }

    educationalAttainmentSyncInProgress = true;
    try {
      familyField.value = resolved;
      if (config.scheduleAutoSave) {
        scheduleFamilyCompositionAutoSave();
      }
      refreshExportValidationGlow();
    } finally {
      educationalAttainmentSyncInProgress = false;
    }
  }

  function syncGranteeEducationalAttainmentFromFamilyCompositionToBasic(value, options) {
    if (educationalAttainmentSyncInProgress) {
      return;
    }
    const config = {
      scheduleAutoSave: true,
      ...options,
    };
    const basicField = getBasicEducationalAttainmentField();
    if (!basicField) {
      return;
    }
    const resolved =
      resolveSelectOptionValue(basicField, value) ||
      resolveSelectOptionValue(basicField, "Select Level") ||
      normalizeText((basicField.options || [])[0] && basicField.options[0].value);
    if (!resolved || normalizeText(basicField.value) === normalizeText(resolved)) {
      return;
    }

    educationalAttainmentSyncInProgress = true;
    try {
      basicField.value = resolved;
      if (config.scheduleAutoSave) {
        scheduleBasicInfoAutoSave();
      }
      refreshExportValidationGlow();
    } finally {
      educationalAttainmentSyncInProgress = false;
    }
  }

  function getLowbDescription(lowb) {
    const normalized = normalizeText(lowb).toUpperCase();
    if (normalized === "LEVEL 1") {
      return "Survival";
    }
    if (normalized === "LEVEL 2") {
      return "Subsistence";
    }
    if (normalized === "LEVEL 3") {
      return "Self-Sufficient";
    }
    return "";
  }

  function normalizeScsrWellBeingLabel(value) {
    const normalized = normalizeText(value).toUpperCase();
    if (!normalized) {
      return "";
    }
    if (normalized.includes("LEVEL 1")) {
      return "Level 1 - Survival";
    }
    if (normalized.includes("LEVEL 2")) {
      return "Level 2 - Subsistence";
    }
    if (normalized.includes("LEVEL 3")) {
      return "Level 3 - Self - Sufficient";
    }
    return normalizeText(value);
  }

  function buildPrevWellBeingLabel(lowb, swdiScore) {
    const level = normalizeText(lowb);
    const score = normalizeText(swdiScore);
    if (!level && !score) {
      return "";
    }
    if (!level) {
      return score ? `Index Score : ${score}` : "";
    }
    const description = getLowbDescription(level);
    const label = description ? `${level} - ${description}` : level;
    if (!score) {
      return label;
    }
    return `${label} Index Score : ${score}`;
  }

  function collectCsrBasicInfoEditDetails() {
    const contactInfoRaw = getFieldValue("edit-contact-info");
    const nationalIdRaw = getFieldValue("edit-national-id");
    const currentWellBeingLevel = getFieldValue("edit-prev-wellbeing");
    const birthdayValue = normalizeText(basicBirthdayInput && basicBirthdayInput.value);
    return {
      granteeName: normalizeText(basicGranteeNameInput && basicGranteeNameInput.value),
      sex: resolveBasicSexValue(
        normalizeText(basicSexInput && basicSexInput.value)
      ),
      birthday: toFamilyCompositionBirthdayIso(birthdayValue),
      age: normalizeText(basicAgeInput && basicAgeInput.value) || computeAgeFromBirthday(birthdayValue),
      civilStatus: resolveBasicCivilStatusValue(
        normalizeText(basicCivilStatusInput && basicCivilStatusInput.value)
      ),
      educationalAttainment: getFieldValue("edit-educational-attainment"),
      contactInfo: normalizeContactInfoForStorage(contactInfoRaw),
      nationalId: normalizeNationalIdForStorage(nationalIdRaw),
      religion: getFieldValue("edit-religion"),
      yearOfRegistration: getFieldValue("edit-year-registration"),
      yearsInProgram: getFieldValue("edit-years-program"),
      presentAddress: getFieldValue("edit-present-address"),
      placeOfBirth: getFieldValue("edit-place-of-birth"),
      sourceOfInfo: getFieldValue("edit-source-of-info"),
      clientStatusOnExit: getFieldValue("basic-client-status-on-exit"),
      prevWellBeingLevel: currentWellBeingLevel,
      monthlyIncome: getFieldValue("edit-monthly-income"),
      perCapitaIncome: getFieldValue("edit-per-capita-income"),
    };
  }

  function collectScsrBasicInfoEditDetails() {
    const contactInfoRaw = getFieldValue("edit-contact-info");
    const currentWellBeingLevel = getFieldValue("edit-prev-wellbeing");
    const birthdayValue = normalizeText(basicBirthdayInput && basicBirthdayInput.value);
    syncScsrPerCapitaIncomeField();
    return {
      granteeName: normalizeText(basicGranteeNameInput && basicGranteeNameInput.value),
      sex: resolveBasicSexValue(
        normalizeText(basicSexInput && basicSexInput.value)
      ),
      birthday: toFamilyCompositionBirthdayIso(birthdayValue),
      age: normalizeText(basicAgeInput && basicAgeInput.value) || computeAgeFromBirthday(birthdayValue),
      civilStatus: resolveBasicCivilStatusValue(
        normalizeText(basicCivilStatusInput && basicCivilStatusInput.value)
      ),
      educationalAttainment: getFieldValue("edit-educational-attainment"),
      contactInfo: normalizeContactInfoForStorage(contactInfoRaw),
      religion: getFieldValue("edit-religion"),
      presentAddress: getFieldValue("edit-present-address"),
      placeOfBirth: getFieldValue("edit-place-of-birth"),
      sourceOfIncome: getFieldValue("edit-source-of-info"),
      wellBeingLevel: currentWellBeingLevel,
      monthlyIncome: getFieldValue("edit-monthly-income"),
      perCapitaIncome: getFieldValue("edit-per-capita-income"),
    };
  }

  function collectBasicInfoEditDetails() {
    return getActiveRecordWorkflowType() === "SCSR"
      ? collectScsrBasicInfoEditDetails()
      : collectCsrBasicInfoEditDetails();
  }

  function getFieldValue(id) {
    const field = document.getElementById(id);
    return field ? normalizeText(field.value) : "";
  }

  function setFieldValue(id, value) {
    const field = document.getElementById(id);
    if (!field) {
      return;
    }
    field.value = normalizeText(value);
    if (id === SOURCE_OF_INFO_FIELD_ID || id === PREV_WELLBEING_FIELD_ID) {
      refreshBasicInfoDatalistVisibility();
    }
  }

  function applySavedCsrBasicInfoEditDetails(editDetails, prefilledDetails) {
    applySavedBasicInfoSharedFieldEdits(editDetails, prefilledDetails);
    setEducationalAttainmentFieldValue(editDetails.educationalAttainment, false);
    setFieldValue("edit-contact-info", normalizePhilippineMobile(editDetails.contactInfo));
    setFieldValue("edit-national-id", formatNationalId(editDetails.nationalId));
    setFieldValue("edit-religion", editDetails.religion);
    setFieldValue(
      "edit-year-registration",
      normalizeText(editDetails.yearOfRegistration).replace(/\D/g, "").slice(0, 4)
    );
    setFieldValue(
      "edit-years-program",
      normalizeText(editDetails.yearsInProgram).replace(/\D/g, "").slice(0, 2)
    );
    setFieldValue("edit-present-address", editDetails.presentAddress);
    setFieldValue("edit-place-of-birth", editDetails.placeOfBirth);
    setFieldValue("edit-source-of-info", editDetails.sourceOfInfo);
    setFieldValue(
      "basic-client-status-on-exit",
      normalizeText(prefilledDetails.clientStatusOnExit) || editDetails.clientStatusOnExit
    );
    setFieldValue(
      "edit-prev-wellbeing",
      normalizeText(editDetails.wellBeingLevel) || editDetails.prevWellBeingLevel
    );
    setFieldValue("edit-monthly-income", normalizePesoAmountInput(editDetails.monthlyIncome));
    setFieldValue("edit-per-capita-income", normalizePesoAmountInput(editDetails.perCapitaIncome));
  }

  function applySavedScsrBasicInfoEditDetails(editDetails, prefilledDetails) {
    applySavedBasicInfoSharedFieldEdits(editDetails, prefilledDetails);
    setEducationalAttainmentFieldValue(editDetails.educationalAttainment, false);
    setFieldValue("edit-contact-info", normalizePhilippineMobile(editDetails.contactInfo));
    setFieldValue("edit-religion", editDetails.religion);
    setFieldValue("edit-present-address", editDetails.presentAddress);
    setFieldValue("edit-place-of-birth", editDetails.placeOfBirth);
    setFieldValue(
      "edit-source-of-info",
      normalizeText(editDetails.sourceOfIncome) || normalizeText(editDetails.sourceOfInfo)
    );
    setFieldValue(
      "basic-client-status-on-exit",
      normalizeText(prefilledDetails.clientStatusOnExit)
    );
    setFieldValue(
      "edit-prev-wellbeing",
      normalizeText(editDetails.wellBeingLevel) || normalizeScsrWellBeingLabel(prefilledDetails.lowb)
    );
    setFieldValue("edit-monthly-income", normalizePesoAmountInput(editDetails.monthlyIncome));
    setFieldValue("edit-per-capita-income", normalizePesoAmountInput(editDetails.perCapitaIncome));
    syncScsrPerCapitaIncomeField();
    void refreshScsrPerCapitaIncomeFromFamilyComposition({
      scheduleSave: false,
      preserveExistingOnUnresolved: true,
    });
  }

  function applySavedBasicInfoEditDetails() {
    resetBasicInfoEditDetailsForm();

    if (!currentCsrRecord || !currentCsrRecord.basicInformation) {
      return;
    }
    const editDetails = currentCsrRecord.basicInformation.editDetails;
    if (!editDetails || typeof editDetails !== "object") {
      return;
    }
    const prefilledDetails =
      currentCsrRecord &&
      currentCsrRecord.basicInformation &&
      currentCsrRecord.basicInformation.prefilled &&
      typeof currentCsrRecord.basicInformation.prefilled === "object"
        ? currentCsrRecord.basicInformation.prefilled
        : {};

    if (getActiveRecordWorkflowType() === "SCSR") {
      applySavedScsrBasicInfoEditDetails(editDetails, prefilledDetails);
    } else {
      applySavedCsrBasicInfoEditDetails(editDetails, prefilledDetails);
    }

    const savedAt = normalizeText(
      currentCsrRecord &&
      currentCsrRecord.basicInformation &&
      currentCsrRecord.basicInformation.savedAt
    );
    if (savedAt) {
      const mode = normalizeText(
        currentCsrRecord &&
        currentCsrRecord.basicInformation &&
        currentCsrRecord.basicInformation.lastSaveMode
      );
      const label = mode === "autosave" ? "Auto-saved" : "Saved";
      setBasicInfoSaveStatus(`${label} ${formatSaveTimeLabel(savedAt)}`, "success");
    } else {
      setBasicInfoSaveStatus("", "neutral");
    }
  }

  function applySavedCaseDevelopmentDetails() {
    if (activeWorkflowType === "SCSR") {
      applySavedScsrPresentingProblemDetails();
      return;
    }
    applySavedCsrCaseDevelopmentDetails();
  }

  function applySavedCsrCaseDevelopmentDetails() {
    const savedDetails =
      currentCsrRecord &&
      currentCsrRecord.caseDevelopment &&
      typeof currentCsrRecord.caseDevelopment === "object"
        ? currentCsrRecord.caseDevelopment
        : null;

    if (savedDetails) {
      setCaseDevelopmentEditorHtml(savedDetails.html || "");
      const savedAt = normalizeText(savedDetails.savedAt);
      if (savedAt) {
        const mode = normalizeText(savedDetails.lastSaveMode);
        const label = mode === "autosave" ? "Auto-saved" : "Saved";
        setCaseDevelopmentSaveStatus(
          `${label} ${formatSaveTimeLabel(savedAt)}`,
          "success"
        );
      } else {
        setCaseDevelopmentSaveStatus("", "neutral");
      }
      return;
    }

    setCaseDevelopmentEditorHtml("");
    setCaseDevelopmentSaveStatus("", "neutral");
  }

  function applySavedScsrPresentingProblemDetails() {
    const narrativeKey = getCurrentNarrativeRecordKey();
    const savedDetails =
      currentCsrRecord &&
      currentCsrRecord[narrativeKey] &&
      typeof currentCsrRecord[narrativeKey] === "object"
        ? currentCsrRecord[narrativeKey]
        : null;

    if (savedDetails) {
      setCaseDevelopmentEditorHtml(savedDetails.html || "");
      const savedAt = normalizeText(savedDetails.savedAt);
      if (savedAt) {
        const mode = normalizeText(savedDetails.lastSaveMode);
        const label = mode === "autosave" ? "Auto-saved" : "Saved";
        setCaseDevelopmentSaveStatus(
          `${label} ${formatSaveTimeLabel(savedAt)}`,
          "success"
        );
      } else {
        setCaseDevelopmentSaveStatus("", "neutral");
      }
      return;
    }

    setScsrPresentingProblemEditorHtml("");
    setCaseDevelopmentSaveStatus("", "neutral");
  }

  function applySavedScsrBackgroundDetails() {
    if (!scsrBackgroundSummernoteReady || !isActiveScsrBackgroundRecord()) {
      return;
    }
    normalizeScsrBackgroundTabsStoreInMemory();
    activeScsrBackgroundTabKey = getScsrBackgroundActiveTabFromStore();
    renderScsrBackgroundTabs();
    const activeEntry = getScsrBackgroundTabEntry(activeScsrBackgroundTabKey);
    setScsrBackgroundEditorHtml(activeEntry.html || "");
    const savedAt = normalizeText(activeEntry.savedAt);
    if (savedAt) {
      const mode = normalizeText(activeEntry.lastSaveMode);
      const label = mode === "autosave" ? "Auto-saved" : "Saved";
      setScsrBackgroundSaveStatus(`${label} ${formatSaveTimeLabel(savedAt)}`, "success");
    } else {
      setScsrBackgroundSaveStatus("", "neutral");
    }
    setScsrBackgroundFieldError(!normalizeText(getScsrBackgroundEditorHtml()));
  }

  function applySavedScsrCaseAssessmentDetails() {
    if (!scsrCaseAssessmentSummernoteReady) {
      return;
    }
    const savedDetails =
      currentCsrRecord &&
      currentCsrRecord.caseAssessment &&
      typeof currentCsrRecord.caseAssessment === "object"
        ? currentCsrRecord.caseAssessment
        : null;

    if (savedDetails) {
      setScsrCaseAssessmentEditorHtml(savedDetails.html || "");
      const savedAt = normalizeText(savedDetails.savedAt);
      if (savedAt) {
        const mode = normalizeText(savedDetails.lastSaveMode);
        const label = mode === "autosave" ? "Auto-saved" : "Saved";
        setScsrCaseAssessmentSaveStatus(`${label} ${formatSaveTimeLabel(savedAt)}`, "success");
      } else {
        setScsrCaseAssessmentSaveStatus("", "neutral");
      }
    } else {
      setScsrCaseAssessmentEditorHtml("");
      setScsrCaseAssessmentSaveStatus("", "neutral");
    }
    setScsrCaseAssessmentFieldError(!normalizeText(getScsrCaseAssessmentEditorHtml()));
  }

  function applySavedScsrCaseManagementEvaluationDetails() {
    if (!scsrCaseManagementEvaluationSummernoteReady) {
      return;
    }
    const savedDetails =
      currentCsrRecord &&
      currentCsrRecord.caseManagementEvaluation &&
      typeof currentCsrRecord.caseManagementEvaluation === "object"
        ? currentCsrRecord.caseManagementEvaluation
        : null;

    if (savedDetails) {
      setScsrCaseManagementEvaluationEditorHtml(savedDetails.html || "");
      const savedAt = normalizeText(savedDetails.savedAt);
      if (savedAt) {
        const mode = normalizeText(savedDetails.lastSaveMode);
        const label = mode === "autosave" ? "Auto-saved" : "Saved";
        setScsrCaseManagementEvaluationSaveStatus(`${label} ${formatSaveTimeLabel(savedAt)}`, "success");
      } else {
        setScsrCaseManagementEvaluationSaveStatus("", "neutral");
      }
    } else {
      setScsrCaseManagementEvaluationEditorHtml("");
      setScsrCaseManagementEvaluationSaveStatus("", "neutral");
    }
    setScsrCaseManagementEvaluationFieldError(!normalizeText(getScsrCaseManagementEvaluationEditorHtml()));
  }

  function resetBasicInfoEditDetailsForm() {
    getBasicInfoRequiredFields().forEach((field) => {
      if (field.tagName === "SELECT") {
        field.selectedIndex = 0;
      } else {
        field.value = "";
      }
      clearBasicInfoFieldError(field);
    });
    setFieldValue("basic-client-status-on-exit", "");
    setFieldValue("edit-contact-info", "09");
    setFieldValue("edit-monthly-income", "");
    setFieldValue("edit-per-capita-income", "");
    applyPerCapitaIncomeFieldMode(getActiveRecordWorkflowType() === "SCSR");
    setBasicInfoSaveStatus("", "neutral");
  }

  function restoreCsrBasicInfoEditDefaultsFromPrefilled(prefilled, restoreState) {
    const religionBeforeReset = normalizeText(restoreState && restoreState.religionBeforeReset);
    const placeOfBirthBeforeReset = normalizeText(
      restoreState && restoreState.placeOfBirthBeforeReset
    );
    const sourceOfInfoBeforeReset = normalizeText(
      restoreState && restoreState.sourceOfInfoBeforeReset
    );
    const educationalAttainmentFromPrefilled = normalizeText(
      prefilled && prefilled.educationalAttainment
    );
    const presentAddressFromPrefilled = normalizeText(
      prefilled && prefilled.presentAddress
    );
    const yearOfRegistrationFromPrefilled = normalizeText(
      prefilled && prefilled.yearOfRegistration
    );
    const yearsInProgramFromPrefilled = normalizeText(
      prefilled && prefilled.yearsInProgram
    );
    const contactInfoFromPrefilled = normalizeText(
      prefilled && prefilled.contactInfo
    );
    const prevWellBeingFromPrefilled = normalizeText(
      prefilled && prefilled.prevWellBeingLevel
    );
    const nationalIdFromPrefilled = normalizeText(
      prefilled && prefilled.nationalId
    );

    setEducationalAttainmentFieldValue(educationalAttainmentFromPrefilled, false);
    if (basicGranteeNameInput) {
      basicGranteeNameInput.value = normalizeText(prefilled && prefilled.name);
    }
    setBasicSexValue(normalizeText(prefilled && prefilled.sex), "");
    applyBasicInfoBirthdayAndAgeValues(
      normalizeText(prefilled && prefilled.birthday),
      normalizeText(prefilled && prefilled.age)
    );
    setBasicCivilStatusValue(normalizeText(prefilled && prefilled.civilStatus), "");

    const religionField = document.getElementById("edit-religion");
    if (religionField) {
      const preservedReligion = resolveSelectOptionValue(religionField, religionBeforeReset);
      if (preservedReligion) {
        religionField.value = preservedReligion;
      } else if ((religionField.options || []).length) {
        religionField.selectedIndex = 0;
      }
    }

    setFieldValue(
      "edit-year-registration",
      yearOfRegistrationFromPrefilled.replace(/\D/g, "").slice(0, 4)
    );
    setFieldValue(
      "edit-years-program",
      yearsInProgramFromPrefilled.replace(/\D/g, "").slice(0, 2)
    );
    setFieldValue(
      "edit-contact-info",
      normalizePhilippineMobile(normalizeContactInfoFromGrantee(contactInfoFromPrefilled))
    );
    setFieldValue(
      "edit-present-address",
      formatPresentAddressForDisplay(presentAddressFromPrefilled)
    );
    setFieldValue("edit-place-of-birth", placeOfBirthBeforeReset);
    setFieldValue("edit-source-of-info", sourceOfInfoBeforeReset);
    setFieldValue("basic-client-status-on-exit", normalizeText(prefilled && prefilled.clientStatusOnExit));
    setFieldValue("edit-prev-wellbeing", prevWellBeingFromPrefilled);
    setFieldValue("edit-national-id", formatNationalId(nationalIdFromPrefilled));
  }

  function restoreScsrBasicInfoEditDefaultsFromPrefilled(prefilled, restoreState) {
    const religionBeforeReset = normalizeText(restoreState && restoreState.religionBeforeReset);
    const placeOfBirthBeforeReset = normalizeText(
      restoreState && restoreState.placeOfBirthBeforeReset
    );
    const sourceOfInfoBeforeReset = normalizeText(
      restoreState && restoreState.sourceOfInfoBeforeReset
    );
    const monthlyIncomeBeforeReset = normalizeText(
      restoreState && restoreState.monthlyIncomeBeforeReset
    );
    const perCapitaIncomeBeforeReset = normalizeText(
      restoreState && restoreState.perCapitaIncomeBeforeReset
    );

    setEducationalAttainmentFieldValue(prefilled && prefilled.educationalAttainment, false);
    if (basicGranteeNameInput) {
      basicGranteeNameInput.value = normalizeText(prefilled && prefilled.name);
    }
    setBasicSexValue(normalizeText(prefilled && prefilled.sex), "");
    applyBasicInfoBirthdayAndAgeValues(
      normalizeText(prefilled && prefilled.birthday),
      normalizeText(prefilled && prefilled.age)
    );
    setBasicCivilStatusValue(normalizeText(prefilled && prefilled.civilStatus), "");

    const religionField = document.getElementById("edit-religion");
    if (religionField) {
      const religionFromPrefilled = resolveSelectOptionValue(
        religionField,
        normalizeText(prefilled && prefilled.religion)
      );
      const preservedReligion = religionFromPrefilled ||
        resolveSelectOptionValue(religionField, religionBeforeReset);
      if (preservedReligion) {
        religionField.value = preservedReligion;
      } else if ((religionField.options || []).length) {
        religionField.selectedIndex = 0;
      }
    }

    setFieldValue(
      "edit-contact-info",
      normalizePhilippineMobile(normalizeContactInfoFromGrantee(prefilled && prefilled.contactInfo))
    );
    setFieldValue(
      "edit-present-address",
      formatPresentAddressForDisplay(prefilled && prefilled.presentAddress)
    );
    setFieldValue("edit-place-of-birth", placeOfBirthBeforeReset);
    setFieldValue("edit-source-of-info", sourceOfInfoBeforeReset);
    setFieldValue("basic-client-status-on-exit", normalizeText(prefilled && prefilled.clientStatusOnExit));
    setFieldValue(
      "edit-prev-wellbeing",
      normalizeScsrWellBeingLabel(prefilled && prefilled.lowb)
    );
    setFieldValue("edit-monthly-income", normalizePesoAmountInput(monthlyIncomeBeforeReset));
    syncScsrPerCapitaIncomeField();
  }

  function restoreBasicInfoEditDefaultsFromPrefilled(prefilled) {
    const religionFieldBeforeReset = document.getElementById("edit-religion");
    const placeOfBirthBeforeReset = getFieldValue("edit-place-of-birth");
    const sourceOfInfoBeforeReset = getFieldValue("edit-source-of-info");
    const yearOfRegistrationBeforeReset = getFieldValue("edit-year-registration");
    const yearsInProgramBeforeReset = getFieldValue("edit-years-program");
    const contactInfoBeforeReset = getFieldValue("edit-contact-info");
    const prevWellBeingBeforeReset = getFieldValue("edit-prev-wellbeing");
    const nationalIdBeforeReset = getFieldValue("edit-national-id");
    const monthlyIncomeBeforeReset = getFieldValue("edit-monthly-income");
    const perCapitaIncomeBeforeReset = getFieldValue("edit-per-capita-income");
    const religionBeforeReset = normalizeText(
      religionFieldBeforeReset ? religionFieldBeforeReset.value : ""
    );

    resetBasicInfoEditDetailsForm();
    const restoreState = {
      religionBeforeReset,
      placeOfBirthBeforeReset,
      sourceOfInfoBeforeReset,
      yearOfRegistrationBeforeReset,
      yearsInProgramBeforeReset,
      contactInfoBeforeReset,
      prevWellBeingBeforeReset,
      nationalIdBeforeReset,
      monthlyIncomeBeforeReset,
      perCapitaIncomeBeforeReset,
    };
    if (getActiveRecordWorkflowType() === "SCSR") {
      restoreScsrBasicInfoEditDefaultsFromPrefilled(prefilled, restoreState);
      return;
    }
    restoreCsrBasicInfoEditDefaultsFromPrefilled(prefilled, restoreState);
  }

  async function handleBasicInfoRestoreClick() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      showToast("No active CSR selected.");
      return;
    }

    const cachedPrefilled =
      currentCsrRecord &&
      currentCsrRecord.basicInformation &&
      currentCsrRecord.basicInformation.prefilled &&
      typeof currentCsrRecord.basicInformation.prefilled === "object"
        ? currentCsrRecord.basicInformation.prefilled
        : null;

    const currentWorkflowType = normalizeWorkflowType(
      (currentCsrRecord && currentCsrRecord.workflowType) || activeWorkflowType
    );
    let prefilled = cachedPrefilled;
    const latestPrefilled = await fetchLatestBasicInfoPrefilledForRecord(
      currentCsrRecord,
      currentWorkflowType
    );
    if (
      currentWorkflowType === "CSR" &&
      (!latestPrefilled || typeof latestPrefilled !== "object")
    ) {
      showToast("Unable to load latest municipality data for restore.");
      return;
    }
    if (latestPrefilled && typeof latestPrefilled === "object") {
      prefilled = {
        ...(cachedPrefilled && typeof cachedPrefilled === "object" ? cachedPrefilled : {}),
        ...latestPrefilled,
      };
    }

    if (!prefilled || !hasCachedBasicInfoPrefilled(prefilled)) {
      showToast("No prefilled Basic Information values found.");
      return;
    }
    const subjectLabel = currentWorkflowType === "SCSR" ? "current client" : "current grantee";
    const confirmed = await confirmUserAction(
      `Are you sure you want to restore the default values of ${subjectLabel}?`
    );
    if (!confirmed) {
      return;
    }

    if (basicInfoAutoSaveTimer) {
      window.clearTimeout(basicInfoAutoSaveTimer);
      basicInfoAutoSaveTimer = null;
    }

    currentCsrRecord.basicInformation = {
      ...(currentCsrRecord.basicInformation || {}),
      prefilled,
    };
    restoreBasicInfoEditDefaultsFromPrefilled(prefilled);
    refreshExportValidationGlow();
    const saved = await persistBasicInfoEditDetails({ isAutoSave: false, showToastOnError: true });
    if (saved) {
      showToast("Restored to prefilled defaults.", "success", 2800);
    }
  }

  async function persistBasicInfoEditDetails(options) {
    const config = {
      isAutoSave: false,
      showToastOnError: true,
      ...options,
    };

    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return false;
    }

    const editDetails = collectBasicInfoEditDetails();
    currentCsrRecord.basicInformation = {
      ...(currentCsrRecord.basicInformation || {}),
      editDetails,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(currentCsrRecord.basicInformation.savedAt);
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setBasicInfoSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      const snapshot = buildRecordSyncSnapshot(currentCsrRecord, {
        includeBasicInfo: true,
      });
      if (snapshot) {
        void enqueueCrossWorkflowSync(() =>
          syncRecordToCounterpartWorkflow(snapshot, {
            syncBasicInfo: true,
            sourceSavedAt: normalizeText(
              snapshot &&
              snapshot.basicInformation &&
              snapshot.basicInformation.savedAt
            ),
          })
        );
      }
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setBasicInfoSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Basic Information right now.");
      }
      return false;
    }
  }

  async function populateBasicInfoFromSelectedCard(cardData, expectedCsrId) {
    const requestSeq = ++basicInfoPrefillRequestSeq;
    const targetCsrId = String(
      typeof expectedCsrId !== "undefined"
        ? expectedCsrId
        : currentCsrRecord && currentCsrRecord.csrId
    );

    if (!isActiveCsrPrefillRequest(targetCsrId, requestSeq)) {
      return;
    }

    const cachedPrefilled =
      currentCsrRecord &&
      currentCsrRecord.basicInformation &&
      currentCsrRecord.basicInformation.prefilled
        ? currentCsrRecord.basicInformation.prefilled
        : null;
    const hasCachedPrefilled = hasCompleteBasicInfoPrefilled(cachedPrefilled);
    if (hasCachedPrefilled && isActiveCsrPrefillRequest(targetCsrId, requestSeq)) {
      // Show cached values immediately, then refresh from latest municipality rows.
      fillBasicInfoLeftFieldsFromPrefilled(cachedPrefilled);
      reapplySavedBasicInfoSharedFieldEdits();
    }

    setBasicInfoPrefillLoading(true);
    const municipality = normalizeText(cardData && cardData.municipality).toUpperCase();
    const hhid = normalizeText(cardData && cardData.hhid);
    const name = normalizeText(cardData && cardData.name).toUpperCase();
    if (!municipality || (!hhid && !name)) {
      if (isActiveCsrPrefillRequest(targetCsrId, requestSeq)) {
        fillBasicInfoLeftFields(null);
        reapplySavedBasicInfoSharedFieldEdits();
      }
      if (requestSeq === basicInfoPrefillRequestSeq) {
        setBasicInfoPrefillLoading(false);
      }
      return;
    }

    try {
      const municipalityRows = await loadMunicipalityRecordsForCards(municipality);
      if (!isActiveCsrPrefillRequest(targetCsrId, requestSeq)) {
        return;
      }
      const granteeRow = findGranteeRowForBasicInfo(municipalityRows, hhid, name);
      fillBasicInfoLeftFields(granteeRow);
      if (currentCsrRecord) {
        const nextPrefilled = buildBasicInfoPrefilledFromGranteeRow(
          granteeRow,
          (currentCsrRecord && currentCsrRecord.workflowType) || activeWorkflowType
        );
        currentCsrRecord.basicInformation = {
          ...(currentCsrRecord.basicInformation || {}),
          prefilled: nextPrefilled,
        };
        await persistCsrRecord(currentCsrRecord);
      }
      reapplySavedBasicInfoSharedFieldEdits();
    } catch (_) {
      if (isActiveCsrPrefillRequest(targetCsrId, requestSeq) && !hasCachedPrefilled) {
        fillBasicInfoLeftFields(null);
        reapplySavedBasicInfoSharedFieldEdits();
      }
    } finally {
      if (requestSeq === basicInfoPrefillRequestSeq) {
        setBasicInfoPrefillLoading(false);
      }
    }
  }

  async function populateFamilyCompositionFromSelectedCard(cardData) {
    if (!familyCompositionList || !familyCompositionEmpty) {
      return;
    }

    const municipality = normalizeText(cardData && cardData.municipality).toUpperCase();
    const hhid = normalizeText(cardData && cardData.hhid);
    if (!municipality || !hhid) {
      latestFamilyCompositionRows = [];
      renderFamilyCompositionRows([]);
      updateFamilyCompositionRestoreButtonVisibility();
      return;
    }

    familyCompositionList.innerHTML =
      '<div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] p-4 text-sm text-slate-500 dark:text-slate-300">Loading family composition...</div>';
    familyCompositionEmpty.classList.add("hidden");

    try {
      const municipalityRows = await loadMunicipalityRecordsForCards(municipality);
      const rows = Array.isArray(municipalityRows)
        ? municipalityRows.filter(
            (row) => normalizeText(row && row.HH_ID) === hhid
          )
        : [];
      latestFamilyCompositionRows = rows;
      await reconcileFamilyCompositionStoresWithDataset(rows);
      renderFamilyCompositionRows(rows);
      updateFamilyCompositionRestoreButtonVisibility();
    } catch (_) {
      latestFamilyCompositionRows = [];
      familyCompositionList.innerHTML =
        '<div class="rounded-lg border border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-300">Unable to load family composition right now.</div>';
      familyCompositionEmpty.classList.add("hidden");
      updateFamilyCompositionRestoreButtonVisibility();
    }
  }

  function getFamilyCompositionMembersStore() {
    const familyComposition =
      currentCsrRecord && currentCsrRecord.familyComposition
        ? currentCsrRecord.familyComposition
        : null;
    if (!familyComposition || typeof familyComposition !== "object") {
      return {};
    }
    const members = familyComposition.members;
    return members && typeof members === "object" ? members : {};
  }

  function getFamilyCompositionDeletedKeysStore() {
    const familyComposition =
      currentCsrRecord && currentCsrRecord.familyComposition
        ? currentCsrRecord.familyComposition
        : null;
    const keys = familyComposition && Array.isArray(familyComposition.deletedMemberKeys)
      ? familyComposition.deletedMemberKeys
      : [];
    return new Set(keys.map((value) => normalizeText(value)).filter(Boolean));
  }

  function getFamilyCompositionAddedMembersStore() {
    const familyComposition =
      currentCsrRecord && currentCsrRecord.familyComposition
        ? currentCsrRecord.familyComposition
        : null;
    const addedMembers = familyComposition && Array.isArray(familyComposition.addedMembers)
      ? familyComposition.addedMembers
      : [];
    return addedMembers
      .filter((member) => member && typeof member === "object")
      .map((member) => cloneJsonValue(member) || {});
  }

  function getFamilyCompositionProfileOverridesStore() {
    const familyComposition =
      currentCsrRecord && currentCsrRecord.familyComposition
        ? currentCsrRecord.familyComposition
        : null;
    if (!familyComposition || typeof familyComposition !== "object") {
      return {};
    }
    const overrides = familyComposition.memberProfileOverrides;
    return overrides && typeof overrides === "object" ? cloneJsonValue(overrides) || {} : {};
  }

  function isAddedFamilyCompositionRow(row) {
    return normalizeText(row && row.ADDED_MEMBER).toUpperCase() === "YES";
  }

  function getFamilyCompositionRenderRows(rows) {
    const sourceRows = Array.isArray(rows) ? rows : [];
    const addedMembers = getFamilyCompositionAddedMembersStore();
    if (!addedMembers.length) {
      return sourceRows.slice();
    }
    return sourceRows.concat(addedMembers);
  }

  function getFamilyCompositionRowAgeValue(row) {
    const directAge = normalizeText(row && row.AGE);
    if (directAge) {
      return directAge;
    }
    return computeAgeFromBirthday(row && row.BIRTHDAY);
  }

  function getFamilyCompositionResolvedMemberProfile(row) {
    const memberKey = getFamilyCompositionMemberKey(row);
    const overrides = getFamilyCompositionProfileOverridesStore();
    const profileOverride =
      memberKey &&
      overrides[memberKey] &&
      typeof overrides[memberKey] === "object"
        ? overrides[memberKey]
        : {};
    const birthdaySource =
      normalizeText(profileOverride.birthday) ||
      normalizeText(row && row.BIRTHDAY);
    const birthdayIso = toFamilyCompositionBirthdayIso(birthdaySource);
    const age =
      normalizeText(profileOverride.age) ||
      computeAgeFromBirthday(birthdayIso) ||
      normalizeText(row && row.AGE);
    return {
      memberKey,
      entryId: normalizeText(row && row.ENTRY_ID),
      name:
        normalizeText(profileOverride.name) ||
        normalizeText(row && (row.NAMES || row.NAME)),
      relationship:
        normalizeText(profileOverride.relationship) ||
        normalizeText(row && row.RELATION_TO_HH_HEAD),
      birthday: birthdayIso,
      age,
      sex:
        normalizeText(profileOverride.sex) ||
        normalizeText(row && row.SEX),
      civilStatus:
        normalizeText(profileOverride.civilStatus) ||
        normalizeText(row && row.CIVIL_STATUS),
    };
  }

  function findFamilyCompositionRowByMemberKey(memberKey) {
    if (!memberKey) {
      return null;
    }
    return (
      getFamilyCompositionRenderRows(latestFamilyCompositionRows).find(
        (row) => getFamilyCompositionMemberKey(row) === memberKey
      ) || null
    );
  }

  function normalizeFamilyCompositionAddedMemberName(value) {
    const uppercase = normalizeText(value).toUpperCase().replace(/\d+/g, "");
    return uppercase.replace(/\s+/g, " ").trim();
  }

  function formatFamilyCompositionAddedMemberNameForInput(value) {
    const raw = String(value == null ? "" : value)
      .toUpperCase()
      .replace(/\d+/g, "")
      .replace(/[^\p{L}\s.,'-]/gu, "");
    return raw.replace(/\s{2,}/g, " ");
  }

  function getFamilyCompositionExistingEntryIds() {
    const ids = new Set();
    const sourceRows = Array.isArray(latestFamilyCompositionRows)
      ? latestFamilyCompositionRows
      : [];
    sourceRows.forEach((row) => {
      const entryId = normalizeText(row && row.ENTRY_ID);
      if (entryId) {
        ids.add(entryId);
      }
    });
    getFamilyCompositionAddedMembersStore().forEach((row) => {
      const entryId = normalizeText(row && row.ENTRY_ID);
      if (entryId) {
        ids.add(entryId);
      }
    });
    return ids;
  }

  function generateUniqueFamilyCompositionMemberId() {
    const existingIds = getFamilyCompositionExistingEntryIds();
    for (let attempt = 0; attempt < 500; attempt += 1) {
      const nextId = String(Math.floor(10000000 + Math.random() * 90000000));
      if (!existingIds.has(nextId)) {
        return nextId;
      }
    }
    const base = Date.now().toString().slice(-8);
    if (!existingIds.has(base)) {
      return base;
    }
    let fallback = 10000000;
    while (existingIds.has(String(fallback)) && fallback <= 99999999) {
      fallback += 1;
    }
    return String(Math.min(fallback, 99999999));
  }

  function buildAddedFamilyCompositionDefaultEntry(row) {
    return {
      monitoredChild: normalizeFamilyCompositionFieldForStorage("monitoredChild", "No"),
      educationalAttainment: normalizeFamilyCompositionFieldForStorage(
        "educationalAttainment",
        "Select Level"
      ),
      birthday: normalizeFamilyCompositionFieldForStorage("birthday", row && row.BIRTHDAY),
      occupation: normalizeFamilyCompositionFieldForStorage("occupation", ""),
      monthlyIncome: normalizeFamilyCompositionFieldForStorage("monthlyIncome", ""),
      typeOfDisability: normalizeFamilyCompositionFieldForStorage("typeOfDisability", "None"),
    };
  }

  function shouldShowNewlyAddedMemberBadge(row) {
    if (!isAddedFamilyCompositionRow(row)) {
      return false;
    }
    const until = normalizeText(row && row.showNewlyAddedBadgeUntil);
    if (!until) {
      return false;
    }
    const deadline = Date.parse(until);
    if (Number.isNaN(deadline)) {
      return false;
    }
    return deadline > Date.now();
  }

  function syncFamilyCompositionAddedMemberBadgeState(rows) {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    const addedMembers = getFamilyCompositionAddedMembersStore();
    if (!addedMembers.length) {
      return;
    }
    const expiredIds = new Set(
      (Array.isArray(rows) ? rows : [])
        .filter((row) => isAddedFamilyCompositionRow(row) && !shouldShowNewlyAddedMemberBadge(row))
        .map((row) => normalizeText(row && row.ENTRY_ID))
        .filter(Boolean)
    );
    if (!expiredIds.size) {
      return;
    }
    let changed = false;
    const nextAddedMembers = addedMembers.map((member) => {
      const entryId = normalizeText(member && member.ENTRY_ID);
      if (!entryId || !expiredIds.has(entryId) || !normalizeText(member && member.showNewlyAddedBadgeUntil)) {
        return member;
      }
      changed = true;
      return {
        ...member,
        showNewlyAddedBadgeUntil: "",
      };
    });
    if (!changed) {
      return;
    }
    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      addedMembers: nextAddedMembers,
    };
    void persistCsrRecord(currentCsrRecord);
  }

  function scheduleFamilyCompositionNewMemberBadgeRefresh(rows) {
    if (familyCompositionNewMemberBadgeTimer) {
      window.clearTimeout(familyCompositionNewMemberBadgeTimer);
      familyCompositionNewMemberBadgeTimer = null;
    }
    const deadlines = (Array.isArray(rows) ? rows : [])
      .filter((row) => isAddedFamilyCompositionRow(row))
      .map((row) => Date.parse(normalizeText(row && row.showNewlyAddedBadgeUntil)))
      .filter((value) => Number.isFinite(value) && value > Date.now());
    if (!deadlines.length) {
      return;
    }
    const nextDelay = Math.max(Math.min(Math.min(...deadlines) - Date.now() + 50, 2147483647), 50);
    familyCompositionNewMemberBadgeTimer = window.setTimeout(() => {
      familyCompositionNewMemberBadgeTimer = null;
      renderFamilyCompositionRows(latestFamilyCompositionRows);
    }, nextDelay);
  }

  function updateFamilyCompositionRestoreButtonVisibility() {
    if (!familyCompositionRestoreButton) {
      return;
    }
    const deletedCount = getFamilyCompositionDeletedKeysStore().size;
    const shouldShow = deletedCount > 0;
    familyCompositionRestoreButton.classList.toggle("hidden", !shouldShow);
    familyCompositionRestoreButton.classList.toggle("inline-flex", shouldShow);
  }

  async function reconcileFamilyCompositionStoresWithDataset(rows) {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    const normalizedRows = Array.isArray(rows) ? rows : [];
    const addedRows = getFamilyCompositionAddedMembersStore();
    const allRows = normalizedRows.concat(addedRows);
    const availableKeys = new Set(
      allRows
        .map((row) => getFamilyCompositionMemberKey(row))
        .filter(Boolean)
    );
    // Map older member key formats to ENTRY_ID|HH_ID keys for backward compatibility.
    const legacyToEntryHhKey = new Map();
    allRows.forEach((row) => {
      const stableKey = getFamilyCompositionStableMemberKey(row);
      const entryOnlyKey = getFamilyCompositionEntryOnlyMemberKey(row);
      const entryHhKey = getFamilyCompositionEntryMemberKey(row);
      if (stableKey && entryHhKey && stableKey !== entryHhKey) {
        legacyToEntryHhKey.set(stableKey, entryHhKey);
      }
      if (entryOnlyKey && entryHhKey && entryOnlyKey !== entryHhKey) {
        legacyToEntryHhKey.set(entryOnlyKey, entryHhKey);
      }
    });
    const existingMembers = getFamilyCompositionMembersStore();
    const existingDeleted = getFamilyCompositionDeletedKeysStore();
    const existingProfileOverrides = getFamilyCompositionProfileOverridesStore();
    const cleanedMembers = {};
    const cleanedProfileOverrides = {};
    Object.keys(existingMembers).forEach((memberKey) => {
      if (availableKeys.has(memberKey)) {
        cleanedMembers[memberKey] = existingMembers[memberKey];
        return;
      }
      const mappedKey = legacyToEntryHhKey.get(memberKey);
      if (mappedKey && availableKeys.has(mappedKey)) {
        if (!Object.prototype.hasOwnProperty.call(cleanedMembers, mappedKey)) {
          cleanedMembers[mappedKey] = existingMembers[memberKey];
        }
      }
    });
    const cleanedDeleted = Array.from(existingDeleted)
      .map((memberKey) => legacyToEntryHhKey.get(memberKey) || memberKey)
      .filter((memberKey) => availableKeys.has(memberKey))
      .filter((memberKey) => !isGranteeMemberKey(memberKey));
    Object.keys(existingProfileOverrides).forEach((memberKey) => {
      if (availableKeys.has(memberKey)) {
        cleanedProfileOverrides[memberKey] = existingProfileOverrides[memberKey];
        return;
      }
      const mappedKey = legacyToEntryHhKey.get(memberKey);
      if (mappedKey && availableKeys.has(mappedKey)) {
        if (!Object.prototype.hasOwnProperty.call(cleanedProfileOverrides, mappedKey)) {
          cleanedProfileOverrides[mappedKey] = existingProfileOverrides[memberKey];
        }
      }
    });

    const previousDeleted = Array.from(existingDeleted);
    const existingMemberKeys = Object.keys(existingMembers).sort();
    const cleanedMemberKeys = Object.keys(cleanedMembers).sort();
    const existingOverrideKeys = Object.keys(existingProfileOverrides).sort();
    const cleanedOverrideKeys = Object.keys(cleanedProfileOverrides).sort();
    const memberChanged =
      existingMemberKeys.length !== cleanedMemberKeys.length ||
      existingMemberKeys.some((key, index) => key !== cleanedMemberKeys[index]) ||
      cleanedMemberKeys.some((key) => {
        const before = existingMembers[key];
        const after = cleanedMembers[key];
        return JSON.stringify(before || {}) !== JSON.stringify(after || {});
      });
    const deletedChanged =
      cleanedDeleted.length !== previousDeleted.length ||
      cleanedDeleted.some((key, idx) => key !== previousDeleted[idx]);
    const profileOverridesChanged =
      existingOverrideKeys.length !== cleanedOverrideKeys.length ||
      existingOverrideKeys.some((key, index) => key !== cleanedOverrideKeys[index]) ||
      cleanedOverrideKeys.some((key) => {
        const before = existingProfileOverrides[key];
        const after = cleanedProfileOverrides[key];
        return JSON.stringify(before || {}) !== JSON.stringify(after || {});
      });

    if (!memberChanged && !deletedChanged && !profileOverridesChanged) {
      return;
    }

    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members: cleanedMembers,
      memberProfileOverrides: cleanedProfileOverrides,
      deletedMemberKeys: cleanedDeleted,
      savedAt: new Date().toISOString(),
      lastSaveMode: "autosave",
    };
    await persistCsrRecord(currentCsrRecord);
  }

  function getFamilyCompositionMemberKey(row) {
    const entryKey = getFamilyCompositionEntryMemberKey(row);
    if (entryKey) {
      return entryKey;
    }
    return getFamilyCompositionStableMemberKey(row);
  }

  function getFamilyCompositionStableMemberKey(row) {
    const hhid = normalizeText(row && row.HH_ID);
    const name = normalizeText(row && (row.NAMES || row.NAME));
    const birthday = normalizeText(row && row.BIRTHDAY);
    if (!hhid && !name && !birthday) {
      return "";
    }
    return `${hhid}|${name}|${birthday}`;
  }

  function getFamilyCompositionEntryMemberKey(row) {
    const entryId = normalizeText(row && row.ENTRY_ID);
    if (!entryId) {
      return "";
    }
    const hhid = normalizeText(row && row.HH_ID);
    if (hhid) {
      return `${entryId}|${hhid}`;
    }
    return entryId;
  }

  function getFamilyCompositionEntryOnlyMemberKey(row) {
    const entryId = normalizeText(row && row.ENTRY_ID);
    if (entryId) {
      return entryId;
    }
    return "";
  }

  function resolveMonitoredChildDefault(row) {
    const healthMonitored = normalizeText(row && row.HEALTH_MONITORED).toUpperCase();
    const educMonitored = normalizeText(row && row.EDUC_MONITORED).toUpperCase();
    if (
      healthMonitored === "MONITORED IN HEALTH" ||
      educMonitored === "YES"
    ) {
      return "Yes";
    }
    if (
      healthMonitored === "NOT MONITORED IN HEALTH" ||
      educMonitored === "NO"
    ) {
      return "No";
    }
    return "No";
  }

  function formatMonthlyIncomeValue(value) {
    const digits = normalizeText(value).replace(/\D/g, "");
    if (!digits) {
      return "";
    }
    const numericValue = Number.parseInt(digits, 10);
    if (!Number.isFinite(numericValue)) {
      return "";
    }
    return `\u20B1 ${numericValue.toLocaleString("en-PH")}`;
  }

  function formatFamilyCompositionBirthdayValue(value) {
    const raw = normalizeText(value);
    if (!raw) {
      return "";
    }

    const numericMatch = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
    if (numericMatch) {
      const month = Number.parseInt(numericMatch[1], 10);
      const day = Number.parseInt(numericMatch[2], 10);
      const year = Number.parseInt(numericMatch[3], 10);
      if (
        Number.isFinite(month) &&
        Number.isFinite(day) &&
        Number.isFinite(year) &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= 31
      ) {
        return `${month}/${day}/${year}`;
      }
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const month = parsed.getMonth() + 1;
      const day = parsed.getDate();
      const year = parsed.getFullYear();
      return `${month}/${day}/${year}`;
    }
    return raw;
  }

  function toFamilyCompositionBirthdayIso(value) {
    const raw = normalizeText(value);
    if (!raw) {
      return "";
    }

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return raw;
    }

    const usMatch = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
    if (usMatch) {
      const month = Number.parseInt(usMatch[1], 10);
      const day = Number.parseInt(usMatch[2], 10);
      const year = Number.parseInt(usMatch[3], 10);
      if (
        Number.isFinite(month) &&
        Number.isFinite(day) &&
        Number.isFinite(year) &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= 31
      ) {
        const mm = String(month).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        return `${year}-${mm}-${dd}`;
      }
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return "";
  }

  function normalizeFamilyCompositionFieldForStorage(fieldName, value) {
    const normalizedValue = normalizeText(value);
    if (fieldName === "occupation") {
      return normalizedValue || "NONE";
    }
    if (fieldName === "monthlyIncome") {
      const formatted = formatMonthlyIncomeValue(normalizedValue);
      return formatted || "NONE";
    }
    if (fieldName === "birthday") {
      return toFamilyCompositionBirthdayIso(normalizedValue);
    }
    return normalizedValue;
  }

  function normalizeFamilyCompositionFieldForDisplay(value) {
    const normalizedValue = normalizeText(value);
    if (!normalizedValue || normalizedValue.toUpperCase() === "NONE") {
      return "";
    }
    return normalizedValue;
  }

  const FAMILY_COMPOSITION_EDITABLE_FIELDS = Object.freeze([
    "monitoredChild",
    "educationalAttainment",
    "birthday",
    "occupation",
    "monthlyIncome",
    "typeOfDisability",
  ]);

  const FAMILY_COMPOSITION_RESET_PRESERVE_FIELDS_BY_WORKFLOW = Object.freeze({
    CSR: Object.freeze(["occupation", "monthlyIncome"]),
    SCSR: Object.freeze(["occupation", "monthlyIncome"]),
  });

  function shouldPreserveFamilyCompositionFieldOnReset(fieldName, workflowType) {
    const normalizedWorkflow = normalizeWorkflowType(workflowType);
    const preservedFields =
      FAMILY_COMPOSITION_RESET_PRESERVE_FIELDS_BY_WORKFLOW[normalizedWorkflow];
    if (!Array.isArray(preservedFields) || preservedFields.length === 0) {
      return false;
    }
    return preservedFields.includes(fieldName);
  }

  function getFamilyCompositionDefaultFieldValue(fieldName, row, workflowType) {
    const isScsrWorkflow = normalizeWorkflowType(workflowType) === "SCSR";
    if (isScsrWorkflow && (fieldName === "occupation" || fieldName === "monthlyIncome")) {
      return "";
    }
    switch (fieldName) {
      case "monitoredChild":
        return resolveMonitoredChildDefault(row);
      case "educationalAttainment":
        return row && row.GRADE_LEVEL;
      case "birthday":
        return row && row.BIRTHDAY;
      case "occupation":
        return row && row.OCCUPATION;
      case "monthlyIncome":
        return row && row.MONTHLY_INCOME;
      case "typeOfDisability":
        return normalizeText(row && row.DISABILITY_TYPES) || "None";
      default:
        return "";
    }
  }

  function buildFamilyCompositionDefaultEntry(row) {
    const workflowType = getActiveRecordWorkflowType();
    return {
      monitoredChild: normalizeFamilyCompositionFieldForStorage(
        "monitoredChild",
        getFamilyCompositionDefaultFieldValue("monitoredChild", row, workflowType)
      ),
      educationalAttainment: normalizeFamilyCompositionFieldForStorage(
        "educationalAttainment",
        getFamilyCompositionDefaultFieldValue("educationalAttainment", row, workflowType)
      ),
      birthday: normalizeFamilyCompositionFieldForStorage(
        "birthday",
        getFamilyCompositionDefaultFieldValue("birthday", row, workflowType)
      ),
      occupation: normalizeFamilyCompositionFieldForStorage(
        "occupation",
        getFamilyCompositionDefaultFieldValue("occupation", row, workflowType)
      ),
      monthlyIncome: normalizeFamilyCompositionFieldForStorage(
        "monthlyIncome",
        getFamilyCompositionDefaultFieldValue("monthlyIncome", row, workflowType)
      ),
      typeOfDisability: normalizeFamilyCompositionFieldForStorage(
        "typeOfDisability",
        getFamilyCompositionDefaultFieldValue("typeOfDisability", row, workflowType)
      ),
    };
  }

  function getFamilyCompositionAddMemberFields() {
    return [
      familyCompositionAddFullNameField,
      familyCompositionAddRelationshipField,
      familyCompositionAddBirthdayField,
      familyCompositionAddSexField,
      familyCompositionAddCivilStatusField,
    ].filter(Boolean);
  }

  function resetFamilyCompositionAddMemberValidation() {
    getFamilyCompositionAddMemberFields().forEach((field) => {
      clearModalFieldError(field);
    });
  }

  function primeFamilyCompositionAddMemberForm() {
    familyCompositionMemberModalMode = "add";
    familyCompositionEditingMemberKey = "";
    if (familyCompositionAddModalTitle) {
      familyCompositionAddModalTitle.textContent = "Additional Member";
    }
    if (familyCompositionAddMemberIdField) {
      familyCompositionAddMemberIdField.value = generateUniqueFamilyCompositionMemberId();
    }
    if (familyCompositionAddFullNameField) {
      familyCompositionAddFullNameField.value = "";
    }
    if (familyCompositionAddRelationshipField) {
      familyCompositionAddRelationshipField.value = "";
    }
    if (familyCompositionAddBirthdayField) {
      familyCompositionAddBirthdayField.value = "";
      familyCompositionAddBirthdayField.max = getPhilippinesTodayIsoDate();
    }
    if (familyCompositionAddAgeField) {
      familyCompositionAddAgeField.value = "";
    }
    if (familyCompositionAddSexField) {
      familyCompositionAddSexField.value = "";
    }
    if (familyCompositionAddCivilStatusField) {
      familyCompositionAddCivilStatusField.value = "";
    }
    resetFamilyCompositionAddMemberValidation();
  }

  function openFamilyCompositionAddMemberModal() {
    if (!familyCompositionAddModal || !currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    primeFamilyCompositionAddMemberForm();
    familyCompositionAddModal.classList.remove("hidden");
    familyCompositionAddModal.classList.add("flex");
  }

  function closeFamilyCompositionAddMemberModal() {
    if (!familyCompositionAddModal) {
      return;
    }
    familyCompositionAddModal.classList.add("hidden");
    familyCompositionAddModal.classList.remove("flex");
    familyCompositionMemberModalMode = "add";
    familyCompositionEditingMemberKey = "";
    if (familyCompositionAddModalTitle) {
      familyCompositionAddModalTitle.textContent = "Additional Member";
    }
    resetFamilyCompositionAddMemberValidation();
  }

  function openFamilyCompositionEditMemberModal(memberKey) {
    if (!familyCompositionAddModal || !memberKey || isGranteeMemberKey(memberKey)) {
      return;
    }
    const row = findFamilyCompositionRowByMemberKey(memberKey);
    if (!row) {
      showToast("Unable to load member details right now.");
      return;
    }
    const profile = getFamilyCompositionResolvedMemberProfile(row);
    familyCompositionMemberModalMode = "edit";
    familyCompositionEditingMemberKey = memberKey;
    if (familyCompositionAddModalTitle) {
      familyCompositionAddModalTitle.textContent = "Edit Member";
    }
    resetFamilyCompositionAddMemberValidation();
    if (familyCompositionAddMemberIdField) {
      familyCompositionAddMemberIdField.value = profile.entryId;
    }
    if (familyCompositionAddFullNameField) {
      familyCompositionAddFullNameField.value = profile.name;
    }
    if (familyCompositionAddRelationshipField) {
      familyCompositionAddRelationshipField.value = profile.relationship;
    }
    if (familyCompositionAddBirthdayField) {
      familyCompositionAddBirthdayField.value = profile.birthday;
      familyCompositionAddBirthdayField.max = getPhilippinesTodayIsoDate();
    }
    if (familyCompositionAddAgeField) {
      familyCompositionAddAgeField.value = profile.age;
    }
    if (familyCompositionAddSexField) {
      familyCompositionAddSexField.value = profile.sex;
    }
    if (familyCompositionAddCivilStatusField) {
      familyCompositionAddCivilStatusField.value = profile.civilStatus;
    }
    familyCompositionAddModal.classList.remove("hidden");
    familyCompositionAddModal.classList.add("flex");
  }

  function handleFamilyCompositionAddFullNameInput() {
    if (!familyCompositionAddFullNameField) {
      return;
    }
    const normalized = formatFamilyCompositionAddedMemberNameForInput(
      familyCompositionAddFullNameField.value
    );
    if (familyCompositionAddFullNameField.value !== normalized) {
      familyCompositionAddFullNameField.value = normalized;
    }
    clearModalFieldError(familyCompositionAddFullNameField);
  }

  function handleFamilyCompositionAddBirthdayInput() {
    if (!familyCompositionAddBirthdayField || !familyCompositionAddAgeField) {
      return;
    }
    familyCompositionAddAgeField.value = computeAgeFromBirthday(
      familyCompositionAddBirthdayField.value
    );
    clearModalFieldError(familyCompositionAddBirthdayField);
  }

  function collectFamilyCompositionAddMemberDraft() {
    const birthday = normalizeText(familyCompositionAddBirthdayField && familyCompositionAddBirthdayField.value);
    const age = computeAgeFromBirthday(birthday);
    return {
      entryId: normalizeText(familyCompositionAddMemberIdField && familyCompositionAddMemberIdField.value),
      fullName: normalizeFamilyCompositionAddedMemberName(
        familyCompositionAddFullNameField && familyCompositionAddFullNameField.value
      ),
      relationship: normalizeText(
        familyCompositionAddRelationshipField && familyCompositionAddRelationshipField.value
      ),
      birthday,
      age,
      sex: normalizeText(familyCompositionAddSexField && familyCompositionAddSexField.value).toUpperCase(),
      civilStatus: normalizeText(
        familyCompositionAddCivilStatusField && familyCompositionAddCivilStatusField.value
      ),
    };
  }

  function validateFamilyCompositionAddMemberDraft(draft, options) {
    const config = {
      allowExistingEntryId: "",
      ...options,
    };
    const safeDraft = draft && typeof draft === "object" ? draft : {};
    let firstInvalidField = null;
    const existingIds = getFamilyCompositionExistingEntryIds();
    const birthdayIso = toFamilyCompositionBirthdayIso(safeDraft.birthday);
    const todayIso = getPhilippinesTodayIsoDate();
    const birthdayInvalid = !birthdayIso || birthdayIso > todayIso;
    const checks = [
      {
        field: familyCompositionAddFullNameField,
        invalid: !safeDraft.fullName || /\d/.test(safeDraft.fullName),
      },
      {
        field: familyCompositionAddRelationshipField,
        invalid: !safeDraft.relationship,
      },
      {
        field: familyCompositionAddBirthdayField,
        invalid: birthdayInvalid,
      },
      {
        field: familyCompositionAddSexField,
        invalid: !safeDraft.sex,
      },
      {
        field: familyCompositionAddCivilStatusField,
        invalid: !safeDraft.civilStatus,
      },
    ];
    checks.forEach(({ field, invalid }) => {
      if (!field) {
        return;
      }
      if (invalid) {
        setModalFieldError(field);
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      } else {
        clearModalFieldError(field);
      }
    });
    const memberIdInvalid =
      !safeDraft.entryId ||
      (existingIds.has(safeDraft.entryId) &&
        normalizeText(config.allowExistingEntryId) !== safeDraft.entryId);
    return {
      valid: !memberIdInvalid && !birthdayInvalid && !!safeDraft.age && !firstInvalidField,
      firstInvalidField,
    };
  }

  async function handleFamilyCompositionAddMemberSubmit() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    const draft = collectFamilyCompositionAddMemberDraft();
    const validation = validateFamilyCompositionAddMemberDraft(draft, {
      allowExistingEntryId:
        familyCompositionMemberModalMode === "edit"
          ? normalizeText(familyCompositionAddMemberIdField && familyCompositionAddMemberIdField.value)
          : "",
    });
    if (!validation.valid) {
      if (validation.firstInvalidField && typeof validation.firstInvalidField.focus === "function") {
        validation.firstInvalidField.focus();
      }
      showToast("Please complete the additional member details.");
      return;
    }

    if (familyCompositionMemberModalMode === "edit") {
      await handleFamilyCompositionEditMemberSubmit(draft);
      return;
    }

    const workflowType = getActiveRecordWorkflowType();
    const createdAt = new Date().toISOString();
    const showUntil = new Date(
      Date.now() + FAMILY_COMPOSITION_NEW_MEMBER_BADGE_DURATION_MS
    ).toISOString();
    const addedRow = {
      ENTRY_ID: draft.entryId,
      HH_ID: normalizeText(currentCsrRecord.cardData && currentCsrRecord.cardData.hhid),
      NAMES: draft.fullName,
      NAME: draft.fullName,
      RELATION_TO_HH_HEAD: draft.relationship,
      SEX: draft.sex,
      BIRTHDAY: toFamilyCompositionBirthdayIso(draft.birthday),
      AGE: draft.age,
      CIVIL_STATUS: draft.civilStatus,
      GRADE_LEVEL: "Select Level",
      OCCUPATION: workflowType === "SCSR" ? "" : "NONE",
      MONTHLY_INCOME: workflowType === "SCSR" ? "" : "NONE",
      DISABILITY_TYPES: "None",
      HEALTH_MONITORED: "NOT MONITORED IN HEALTH",
      EDUC_MONITORED: "NO",
      GRANTEE: "NO",
      MEMBER_STATUS: "1 - Active",
      ADDED_MEMBER: "YES",
      addedAt: createdAt,
      showNewlyAddedBadgeUntil: showUntil,
      defaults: buildAddedFamilyCompositionDefaultEntry({
        BIRTHDAY: draft.birthday,
      }),
    };
    const memberKey = getFamilyCompositionMemberKey(addedRow);
    const nextMembers = collectFamilyCompositionEditsFromDom();
    nextMembers[memberKey] = buildAddedFamilyCompositionDefaultEntry(addedRow);
    const nextAddedMembers = getFamilyCompositionAddedMembersStore();
    nextAddedMembers.push(addedRow);
    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members: nextMembers,
      addedMembers: nextAddedMembers,
      deletedMemberKeys: Array.from(getFamilyCompositionDeletedKeysStore()),
      savedAt: createdAt,
      lastSaveMode: "manual",
    };
    const saved = await persistFamilyCompositionEdits({
      isAutoSave: false,
      membersOverride: nextMembers,
      addedMembersOverride: nextAddedMembers,
    });
    if (!saved) {
      showToast("Unable to add member right now.");
      return;
    }
    closeFamilyCompositionAddMemberModal();
    const expandedKeys = new Set(getFamilyCompositionAccordionExpandedKeys());
    expandedKeys.add(memberKey);
    if (setFamilyCompositionAccordionExpandedKeys(Array.from(expandedKeys))) {
      await persistCsrRecord(currentCsrRecord);
    }
    renderFamilyCompositionRows(latestFamilyCompositionRows);
    showToast("Additional member added.", "success", 2600);
  }

  async function handleFamilyCompositionEditMemberSubmit(draft) {
    const memberKey = normalizeText(familyCompositionEditingMemberKey);
    if (!memberKey) {
      showToast("Unable to update member right now.");
      return;
    }
    const row = findFamilyCompositionRowByMemberKey(memberKey);
    if (!row || isGranteeMemberKey(memberKey)) {
      showToast("Unable to update member right now.");
      return;
    }

    const nextMembers = collectFamilyCompositionEditsFromDom();
    const nextEntry = {
      ...(nextMembers[memberKey] && typeof nextMembers[memberKey] === "object"
        ? nextMembers[memberKey]
        : {}),
    };
    nextEntry.birthday = normalizeFamilyCompositionFieldForStorage("birthday", draft.birthday);
    nextMembers[memberKey] = nextEntry;

    const nextAddedMembers = getFamilyCompositionAddedMembersStore();
    const nextProfileOverrides = getFamilyCompositionProfileOverridesStore();
    if (isAddedFamilyCompositionRow(row)) {
      const updatedAddedMembers = nextAddedMembers.map((member) => {
        if (getFamilyCompositionMemberKey(member) !== memberKey) {
          return member;
        }
        return {
          ...member,
          NAMES: draft.fullName,
          NAME: draft.fullName,
          RELATION_TO_HH_HEAD: draft.relationship,
          SEX: draft.sex,
          BIRTHDAY: toFamilyCompositionBirthdayIso(draft.birthday),
          AGE: draft.age,
          CIVIL_STATUS: draft.civilStatus,
        };
      });
      currentCsrRecord.familyComposition = {
        ...(currentCsrRecord.familyComposition || {}),
        members: nextMembers,
        addedMembers: updatedAddedMembers,
        memberProfileOverrides: nextProfileOverrides,
        deletedMemberKeys: Array.from(getFamilyCompositionDeletedKeysStore()),
        savedAt: new Date().toISOString(),
        lastSaveMode: "manual",
      };
      const saved = await persistFamilyCompositionEdits({
        isAutoSave: false,
        membersOverride: nextMembers,
        addedMembersOverride: updatedAddedMembers,
        profileOverridesOverride: nextProfileOverrides,
      });
      if (saved) {
        closeFamilyCompositionAddMemberModal();
        renderFamilyCompositionRows(latestFamilyCompositionRows);
        showToast("Member updated.", "success", 2400);
      } else {
        showToast("Unable to update member right now.");
      }
      return;
    }

    nextProfileOverrides[memberKey] = {
      name: draft.fullName,
      relationship: draft.relationship,
      birthday: toFamilyCompositionBirthdayIso(draft.birthday),
      age: draft.age,
      sex: draft.sex,
      civilStatus: draft.civilStatus,
    };
    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members: nextMembers,
      addedMembers: nextAddedMembers,
      memberProfileOverrides: nextProfileOverrides,
      deletedMemberKeys: Array.from(getFamilyCompositionDeletedKeysStore()),
      savedAt: new Date().toISOString(),
      lastSaveMode: "manual",
    };
    const saved = await persistFamilyCompositionEdits({
      isAutoSave: false,
      membersOverride: nextMembers,
      addedMembersOverride: nextAddedMembers,
      profileOverridesOverride: nextProfileOverrides,
    });
    if (saved) {
      closeFamilyCompositionAddMemberModal();
      renderFamilyCompositionRows(latestFamilyCompositionRows);
      showToast("Member updated.", "success", 2400);
    } else {
      showToast("Unable to update member right now.");
    }
  }

  function isGranteeFamilyCompositionRow(row) {
    return normalizeText(row && row.GRANTEE).toUpperCase() === "YES";
  }

  function isGranteeMemberKey(memberKey) {
    if (!memberKey) {
      return false;
    }
    return latestFamilyCompositionRows.some(
      (row) =>
        getFamilyCompositionMemberKey(row) === memberKey &&
        isGranteeFamilyCompositionRow(row)
    );
  }

  function getMemberFieldValue(membersStore, memberKey, fieldName, fallbackValue) {
    const saved =
      membersStore &&
      membersStore[memberKey] &&
      Object.prototype.hasOwnProperty.call(membersStore[memberKey], fieldName)
        ? normalizeText(membersStore[memberKey][fieldName])
        : "";
    if (saved) {
      return saved;
    }
    return normalizeText(fallbackValue);
  }

  function createFamilyCompositionSelectOptions(options, selectedValue) {
    const selected = normalizeText(selectedValue);
    return options
      .map((value) => {
        const safeValue = escapeHtml(value);
        const isSelected = normalizeText(value) === selected ? " selected" : "";
        return `<option${isSelected}>${safeValue}</option>`;
      })
      .join("");
  }

  function normalizeFamilyCompositionOptionKey(value) {
    return normalizeText(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "");
  }

  function resolveFamilyCompositionEducationOption(selectedValue, options) {
    const raw = normalizeText(selectedValue);
    if (!raw) {
      return "";
    }

    const directMatch = options.find(
      (option) => normalizeText(option).toUpperCase() === raw.toUpperCase()
    );
    if (directMatch) {
      return directMatch;
    }

    const normalizedRaw = normalizeFamilyCompositionOptionKey(raw);
    const normalizedMatch = options.find(
      (option) => normalizeFamilyCompositionOptionKey(option) === normalizedRaw
    );
    return normalizedMatch || "";
  }

  function createFamilyCompositionEducationOptions(selectedValue) {
    const options = [
      "Select Level",
      "No Grade Completed",
      "Missing",
      "College Graduate",
      "Graduate Studies",
      "4th Year College",
      "3rd Year College",
      "2nd Year College",
      "1st Year College",
      "4TH YEAR COLLEGE / VOCATIONAL",
      "3RD YEAR COLLEGE / VOCATIONAL",
      "2ND YEAR COLLEGE / VOCATIONAL",
      "1ST YEAR COLLEGE / VOCATIONAL",
      "Senior High School Graduate",
      "Senior High School (SHS) ADM/ALS",
      "High School Graduate",
      "Junior High School(JHS) ADM/ALS",
      "Grade 12",
      "Grade 11",
      "Grade 10",
      "Grade 9",
      "Grade 8",
      "Grade 7",
      "Elementary Graduate",
      "Grade 6",
      "Grade 5",
      "Grade 4",
      "Grade 3",
      "Grade 2",
      "Grade 1",
      "Kinder",
      "Kinder / Daycare",
      "Kinder-Elementary ADM/ALS",
      "Day care",
      "Sped Non Graded",
    ];
    const resolvedSelected = resolveFamilyCompositionEducationOption(
      selectedValue,
      options
    );
    return createFamilyCompositionSelectOptions(options, resolvedSelected);
  }

  function createFamilyCompositionDisabilityOptions(selectedValue) {
    const options = [
      "None",
      "Chronic Illness",
      "Chronic Ilness, Mental",
      "Communication",
      "Communication, Not Defined",
      "Learning",
      "Learning, Communication",
      "Learning, Mental",
      "Learning, Not Defined",
      "Learning, Orthopedic, Not Defined",
      "Mental",
      "Mental, Not Defined",
      "Mental, Orthopedic",
      "Not Defined",
      "Orthopedic",
      "Orthopedic, Not Defined",
      "Psychosocial",
      "Psychosocial, Not Defined",
      "Visual",
      "Visual, Communication",
    ];
    const normalizedSelected = normalizeText(selectedValue).toUpperCase();
    const matchedOption = options.find(
      (option) => normalizeText(option).toUpperCase() === normalizedSelected
    );
    const resolvedSelected = matchedOption || "None";
    return createFamilyCompositionSelectOptions(options, resolvedSelected);
  }

  function parseAgeForSort(value) {
    const parsed = Number.parseInt(normalizeText(value), 10);
    return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
  }

  function formatAgeLabel(value) {
    const raw = normalizeText(value);
    if (!raw) {
      return "N/A";
    }
    if (!/^\d+$/.test(raw)) {
      return raw;
    }
    const age = Number.parseInt(raw, 10);
    if (!Number.isFinite(age)) {
      return raw;
    }
    return `${age} ${age === 1 ? "year old" : "years old"}`;
  }

  function getGranteeFamilyCompositionDisplayDetails(row) {
    const live = collectBasicInfoForTemplate();
    return {
      name:
        normalizeText(live && live.granteeName) ||
        normalizeText(row && (row.NAMES || row.NAME)) ||
        "N/A",
      sex:
        normalizeText(live && live.sex) ||
        normalizeText(row && row.SEX) ||
        "N/A",
      ageLabel: formatAgeLabel(
        normalizeText(live && live.age) || normalizeText(row && row.AGE)
      ),
      civilStatus:
        normalizeText(live && live.civilStatus) ||
        normalizeText(row && row.CIVIL_STATUS) ||
        "N/A",
    };
  }

  function getNonGranteeFamilyCompositionDisplayDetails(row) {
    const resolved = getFamilyCompositionResolvedMemberProfile(row);
    return {
      name: resolved.name || "N/A",
      relationship: resolved.relationship || "N/A",
      birthday: resolved.birthday,
      sex: resolved.sex || "N/A",
      ageLabel: formatAgeLabel(resolved.age),
      civilStatus: resolved.civilStatus || "N/A",
    };
  }

  function renderFamilyCompositionRows(rows) {
    if (!familyCompositionList || !familyCompositionEmpty) {
      return;
    }
    const familySavedAt = normalizeText(
      currentCsrRecord &&
      currentCsrRecord.familyComposition &&
      currentCsrRecord.familyComposition.savedAt
    );
    if (familySavedAt) {
      const mode = normalizeText(
        currentCsrRecord &&
        currentCsrRecord.familyComposition &&
        currentCsrRecord.familyComposition.lastSaveMode
      );
      const label = mode === "autosave" ? "Auto-saved" : "Saved";
      setFamilyCompositionSaveStatus(`${label} ${formatSaveTimeLabel(familySavedAt)}`, "success");
    } else {
      setFamilyCompositionSaveStatus("", "neutral");
    }

    const renderRows = getFamilyCompositionRenderRows(rows);
    if (!Array.isArray(renderRows) || renderRows.length === 0) {
      if (familyCompositionNewMemberBadgeTimer) {
        window.clearTimeout(familyCompositionNewMemberBadgeTimer);
        familyCompositionNewMemberBadgeTimer = null;
      }
      familyCompositionList.innerHTML = "";
      familyCompositionEmpty.classList.remove("hidden");
      updateFamilyCompositionRestoreButtonVisibility();
      syncScsrPerCapitaIncomeField({ scheduleSave: true });
      return;
    }

    syncFamilyCompositionAddedMemberBadgeState(renderRows);
    scheduleFamilyCompositionNewMemberBadgeRefresh(renderRows);
    const sortedRows = renderRows
      .slice()
      .sort(
        (a, b) =>
          parseAgeForSort(getFamilyCompositionRowAgeValue(b)) -
          parseAgeForSort(getFamilyCompositionRowAgeValue(a))
      );
    const membersStore = getFamilyCompositionMembersStore();
    const deletedKeys = getFamilyCompositionDeletedKeysStore();
    const expandedKeys = new Set(getFamilyCompositionAccordionExpandedKeys());
    const visibleRows = sortedRows.filter(
      (row) => !deletedKeys.has(getFamilyCompositionMemberKey(row))
    );

    familyCompositionList.innerHTML = visibleRows
      .map((row) => renderFamilyCompositionMemberAccordion(row, membersStore, expandedKeys))
      .join("");
    familyCompositionEmpty.classList.toggle("hidden", visibleRows.length > 0);
    updateFamilyCompositionRestoreButtonVisibility();
    syncScsrPerCapitaIncomeField({ scheduleSave: true });
  }

  function renderFamilyCompositionMemberAccordion(row, membersStore, expandedKeys) {
    const memberKey = getFamilyCompositionMemberKey(row);
    const encodedKey = escapeHtml(memberKey);
    const isGrantee = normalizeText(row && row.GRANTEE).toUpperCase() === "YES";
    const resolvedProfile = getNonGranteeFamilyCompositionDisplayDetails(row);
    const entryId = escapeHtml(normalizeText(row && row.ENTRY_ID) || "N/A");
    const relation = escapeHtml(
      isGrantee ? normalizeText(row && row.RELATION_TO_HH_HEAD) || "N/A" : resolvedProfile.relationship
    );
    const granteeDisplay = isGrantee ? getGranteeFamilyCompositionDisplayDetails(row) : null;
    const name = escapeHtml(
      granteeDisplay ? granteeDisplay.name : resolvedProfile.name
    );
    const sex = escapeHtml(
      granteeDisplay ? granteeDisplay.sex : resolvedProfile.sex
    );
    const age = escapeHtml(
      granteeDisplay ? granteeDisplay.ageLabel : resolvedProfile.ageLabel
    );
    const civilStatus = escapeHtml(
      granteeDisplay
        ? granteeDisplay.civilStatus
        : resolvedProfile.civilStatus
    );
    const granteeTag = isGrantee
      ? '<span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">GRANTEE</span>'
      : "";
    const monitoredChild = getMemberFieldValue(
      membersStore,
      memberKey,
      "monitoredChild",
      resolveMonitoredChildDefault(row)
    );
    const educationalAttainment = getMemberFieldValue(
      membersStore,
      memberKey,
      "educationalAttainment",
      row && row.GRADE_LEVEL
    );
    const birthday = getMemberFieldValue(
      membersStore,
      memberKey,
      "birthday",
      formatFamilyCompositionBirthdayValue(
        getFamilyCompositionDefaultFieldValue("birthday", row, activeWorkflowType)
      )
    );
    const occupation = getMemberFieldValue(
      membersStore,
      memberKey,
      "occupation",
      getFamilyCompositionDefaultFieldValue("occupation", row, activeWorkflowType)
    );
    const monthlyIncome = getMemberFieldValue(
      membersStore,
      memberKey,
      "monthlyIncome",
      getFamilyCompositionDefaultFieldValue("monthlyIncome", row, activeWorkflowType)
    );
    const disability = getMemberFieldValue(
      membersStore,
      memberKey,
      "typeOfDisability",
      normalizeText(row && row.DISABILITY_TYPES) || "None"
    );
    const memberStatusRaw = normalizeText(row && row.MEMBER_STATUS);
    const memberStatusLabel = memberStatusRaw || "Unknown";
    const memberStatusKey = escapeHtml(memberStatusRaw.toUpperCase());
    const canEdit = !isGranteeFamilyCompositionRow(row);
    const canDelete = !isGranteeFamilyCompositionRow(row);
    const isScsr = activeWorkflowType === "SCSR";
    const isExpanded = expandedKeys instanceof Set && expandedKeys.has(memberKey);
    const badge = `<span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">${escapeHtml(memberStatusLabel)}</span>`;
    const newlyAddedBadge = shouldShowNewlyAddedMemberBadge(row)
      ? '<span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] italic font-semibold text-emerald-700 ring-1 ring-emerald-200">Newly added member</span>'
      : "";

    return `
      <details data-fc-accordion data-fc-member-key="${encodedKey}" class="group bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-lg"${isExpanded ? " open" : ""}>
        <summary class="cursor-pointer list-none p-4 flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <div class="font-semibold text-slate-900 dark:text-slate-100">${entryId} - ${name}</div>
              ${granteeTag}
              ${newlyAddedBadge}
            </div>
            <div class="text-sm font-semibold text-slate-500 dark:text-slate-100 mt-1">${relation} &bull; ${sex} &bull; ${age} &bull; ${civilStatus}</div>
          </div>
          <div class="ml-auto flex items-center gap-3">
            ${badge}
            ${canEdit
              ? `<button type="button" data-fc-edit-member="${encodedKey}" class="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600 dark:hover:bg-slate-700">Edit</button>`
              : ""}
            ${canDelete
              ? `<button type="button" data-fc-delete-member="${encodedKey}" class="inline-flex items-center rounded-full bg-red-50 px-3 py-1.5 text-sm font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-100">Delete</button>`
              : ""}
            <span class="text-slate-500 dark:text-slate-400 transition-transform duration-200 group-open:rotate-180">&#9660;</span>
          </div>
        </summary>
        <div class="px-4 pb-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 text-sm" data-fc-member-key="${encodedKey}" data-fc-member-status="${memberStatusKey}">
            <div>
              <label class="text-slate-500 dark:text-slate-400">Monitored Child</label>
              <select data-fc-field="monitoredChild" class="mt-1 w-full h-10 rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white shadow-sm">
                ${createFamilyCompositionSelectOptions(["No", "Yes"], monitoredChild)}
              </select>
            </div>
            <div class="sm:col-span-2 lg:col-span-1">
              <label class="text-slate-500 dark:text-slate-400">Educ. Attainment</label>
              <select data-fc-field="educationalAttainment" class="mt-1 w-full h-10 rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white shadow-sm">
                ${createFamilyCompositionEducationOptions(educationalAttainment)}
              </select>
            </div>
            ${isScsr
              ? `<div>
              <label class="text-slate-500 dark:text-slate-400">Birthday</label>
              <input data-fc-field="birthday" type="date" class="mt-1 w-full h-10 rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white shadow-sm" value="${escapeHtml(toFamilyCompositionBirthdayIso(birthday))}" />
            </div>`
              : ""}
            <div>
              <label class="text-slate-500 dark:text-slate-400">Occupation</label>
              <input data-fc-field="occupation" class="mt-1 w-full h-10 rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white shadow-sm" value="${escapeHtml(normalizeFamilyCompositionFieldForDisplay(occupation))}" />
            </div>
            <div>
              <label class="text-slate-500 dark:text-slate-400">Monthly Income</label>
              <input data-fc-field="monthlyIncome" class="mt-1 w-full h-10 rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white shadow-sm" value="${escapeHtml(formatMonthlyIncomeValue(normalizeFamilyCompositionFieldForDisplay(monthlyIncome)))}" />
            </div>
            <div>
              <label class="text-slate-500 dark:text-slate-400">Type of Disability</label>
              <select data-fc-field="typeOfDisability" class="mt-1 w-full h-10 rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white shadow-sm">
                ${createFamilyCompositionDisabilityOptions(disability)}
              </select>
            </div>
          </div>
        </div>
      </details>`;
  }

  function collectFamilyCompositionEditsFromDom() {
    const members = { ...getFamilyCompositionMembersStore() };
    if (!familyCompositionList) {
      return members;
    }
    const containers = Array.from(
      familyCompositionList.querySelectorAll("[data-fc-member-key]")
    );
    containers.forEach((container) => {
      const memberKey = normalizeText(container.getAttribute("data-fc-member-key"));
      if (!memberKey) {
        return;
      }
      const entry = {};
      Array.from(container.querySelectorAll("[data-fc-field]")).forEach((field) => {
        const key = normalizeText(field.getAttribute("data-fc-field"));
        if (!key) {
          return;
        }
        entry[key] = normalizeFamilyCompositionFieldForStorage(key, field.value);
      });
      members[memberKey] = entry;
    });
    return members;
  }

  function validateFamilyCompositionBeforeManualSave() {
    if (!familyCompositionList) {
      return { valid: true, firstInvalidField: null };
    }
    let firstInvalidField = null;
    const memberContainers = Array.from(
      familyCompositionList.querySelectorAll("[data-fc-member-key]")
    );
    memberContainers.forEach((container) => {
      const memberStatus = normalizeText(
        container.getAttribute("data-fc-member-status")
      ).toUpperCase();
      const skipValidation =
        memberStatus === "2 - DECEASED" || memberStatus === "3 - MOVED OUT";
      const field = container.querySelector('[data-fc-field="educationalAttainment"]');
      if (!field) {
        return;
      }
      if (skipValidation) {
        field.classList.remove("border-red-500", "focus:border-red-500", "focus:ring-red-500");
        return;
      }
      const value = normalizeText(field.value).toUpperCase();
      const invalid = !value || value.startsWith("SELECT");
      field.classList.toggle("border-red-500", invalid);
      field.classList.toggle("focus:border-red-500", invalid);
      field.classList.toggle("focus:ring-red-500", invalid);
      if (invalid && !firstInvalidField) {
        firstInvalidField = field;
      }
    });
    return { valid: !firstInvalidField, firstInvalidField };
  }

  async function persistFamilyCompositionEdits(options) {
    const config = {
      isAutoSave: true,
      membersOverride: null,
      deletedMemberKeysOverride: null,
      addedMembersOverride: null,
      profileOverridesOverride: null,
      ...options,
    };
    if (!isActiveFamilyCompositionRecord()) {
      return false;
    }
    const members =
      config.membersOverride && typeof config.membersOverride === "object"
        ? cloneJsonValue(config.membersOverride) || {}
        : collectFamilyCompositionEditsFromDom();
    const deletedMemberKeys = Array.isArray(config.deletedMemberKeysOverride)
      ? config.deletedMemberKeysOverride.map((value) => normalizeText(value)).filter(Boolean)
      : Array.from(getFamilyCompositionDeletedKeysStore());
    const addedMembers = Array.isArray(config.addedMembersOverride)
      ? cloneJsonValue(config.addedMembersOverride) || []
      : getFamilyCompositionAddedMembersStore();
    const memberProfileOverrides =
      config.profileOverridesOverride && typeof config.profileOverridesOverride === "object"
        ? cloneJsonValue(config.profileOverridesOverride) || {}
        : getFamilyCompositionProfileOverridesStore();
    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members,
      addedMembers,
      memberProfileOverrides,
      deletedMemberKeys,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };
    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(currentCsrRecord.familyComposition.savedAt);
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setFamilyCompositionSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      const snapshot = buildRecordSyncSnapshot(currentCsrRecord, {
        includeFamilyComposition: true,
      });
      if (snapshot) {
        void enqueueCrossWorkflowSync(() =>
          syncRecordToCounterpartWorkflow(snapshot, {
            syncFamilyComposition: true,
            replaceFamilyCompositionState: true,
            sourceSavedAt: normalizeText(
              snapshot &&
              snapshot.familyComposition &&
              snapshot.familyComposition.savedAt
            ),
          })
        );
      }
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setFamilyCompositionSaveStatus(failedLabel, "error");
      return false;
    }
  }

  async function deleteFamilyCompositionMember(memberKey) {
    if (!currentCsrRecord || !currentCsrRecord.csrId || !memberKey) {
      return;
    }
    if (isGranteeMemberKey(memberKey)) {
      showToast("Grantee member cannot be deleted.");
      return;
    }
    const deletedKeys = getFamilyCompositionDeletedKeysStore();
    if (deletedKeys.has(memberKey)) {
      return;
    }
    const existingAddedMembers = getFamilyCompositionAddedMembersStore();
    const isAddedMember = existingAddedMembers.some(
      (member) => getFamilyCompositionMemberKey(member) === memberKey
    );
    if (isAddedMember) {
      const nextMembers = collectFamilyCompositionEditsFromDom();
      delete nextMembers[memberKey];
      const nextProfileOverrides = getFamilyCompositionProfileOverridesStore();
      delete nextProfileOverrides[memberKey];
      currentCsrRecord.familyComposition = {
        ...(currentCsrRecord.familyComposition || {}),
        members: nextMembers,
        addedMembers: existingAddedMembers.filter(
          (member) => getFamilyCompositionMemberKey(member) !== memberKey
        ),
        memberProfileOverrides: nextProfileOverrides,
        deletedMemberKeys: Array.from(deletedKeys),
        savedAt: new Date().toISOString(),
        lastSaveMode: "manual",
      };
      const removed = await persistFamilyCompositionEdits({
        isAutoSave: false,
        membersOverride: nextMembers,
        addedMembersOverride: currentCsrRecord.familyComposition.addedMembers,
        profileOverridesOverride: nextProfileOverrides,
        deletedMemberKeysOverride: Array.from(deletedKeys),
      });
      if (removed) {
        renderFamilyCompositionRows(latestFamilyCompositionRows);
        renderFamilyCompositionRestoreModalList();
        showToast("Added member deleted permanently.", "success", 2500);
      } else {
        showToast("Unable to delete member right now.");
      }
      return;
    }
    deletedKeys.add(memberKey);
    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members: collectFamilyCompositionEditsFromDom(),
      deletedMemberKeys: Array.from(deletedKeys),
      savedAt: new Date().toISOString(),
      lastSaveMode: "manual",
    };
    const saved = await persistFamilyCompositionEdits({
      isAutoSave: false,
      membersOverride: currentCsrRecord.familyComposition.members,
      deletedMemberKeysOverride: currentCsrRecord.familyComposition.deletedMemberKeys,
    });
    if (saved) {
      renderFamilyCompositionRows(latestFamilyCompositionRows);
      renderFamilyCompositionRestoreModalList();
      showToast("Member removed. Use Restore Member to bring it back.", "success", 2500);
    } else {
      showToast("Unable to delete member right now.");
    }
  }

  function openFamilyCompositionRestoreModal() {
    if (!familyCompositionRestoreModal) {
      return;
    }
    renderFamilyCompositionRestoreModalList();
    familyCompositionRestoreModal.classList.remove("hidden");
    familyCompositionRestoreModal.classList.add("flex");
  }

  function closeFamilyCompositionRestoreModal() {
    if (!familyCompositionRestoreModal) {
      return;
    }
    familyCompositionRestoreModal.classList.add("hidden");
    familyCompositionRestoreModal.classList.remove("flex");
  }

  function renderFamilyCompositionRestoreModalList() {
    if (!familyCompositionRestoreList) {
      return;
    }
    const deletedKeys = getFamilyCompositionDeletedKeysStore();
    const deletedRows = latestFamilyCompositionRows.filter((row) =>
      deletedKeys.has(getFamilyCompositionMemberKey(row))
    );
    if (!deletedRows.length) {
      familyCompositionRestoreList.innerHTML =
        '<div class="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-300">No deleted members to restore.</div>';
      return;
    }
    familyCompositionRestoreList.innerHTML = deletedRows
      .map((row) => {
        const key = getFamilyCompositionMemberKey(row);
        const resolved = getNonGranteeFamilyCompositionDisplayDetails(row);
        const name = escapeHtml(resolved.name || "N/A");
        const sex = escapeHtml(resolved.sex || "N/A");
        const age = escapeHtml(resolved.ageLabel || "N/A");
        const civilStatus = escapeHtml(resolved.civilStatus || "N/A");
        const relation = escapeHtml(resolved.relationship || "N/A");
        return `
          <div class="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div class="font-semibold text-slate-900 dark:text-slate-100">${name}</div>
            <div class="mt-1 text-sm text-slate-700 dark:text-slate-300">${relation} &bull; ${sex} &bull; ${age} &bull; ${civilStatus}</div>
            <div class="mt-3 flex justify-end">
              <button type="button" data-fc-restore-member="${escapeHtml(key)}" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600">
                <span class="material-symbols-outlined text-[18px]">restore</span>
                Restore
              </button>
            </div>
          </div>`;
      })
      .join("");
  }

  function handleFamilyCompositionRestoreListClick(event) {
    const button = event.target.closest("[data-fc-restore-member]");
    if (!button) {
      return;
    }
    const memberKey = normalizeText(button.getAttribute("data-fc-restore-member"));
    if (!memberKey) {
      return;
    }
    void restoreFamilyCompositionMember(memberKey);
  }

  async function restoreFamilyCompositionMember(memberKey) {
    if (!currentCsrRecord || !currentCsrRecord.csrId || !memberKey) {
      return;
    }
    const deletedKeys = getFamilyCompositionDeletedKeysStore();
    if (!deletedKeys.has(memberKey)) {
      return;
    }
    deletedKeys.delete(memberKey);
    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members: collectFamilyCompositionEditsFromDom(),
      deletedMemberKeys: Array.from(deletedKeys),
      savedAt: new Date().toISOString(),
      lastSaveMode: "manual",
    };
    const saved = await persistFamilyCompositionEdits({
      isAutoSave: false,
      membersOverride: currentCsrRecord.familyComposition.members,
      deletedMemberKeysOverride: currentCsrRecord.familyComposition.deletedMemberKeys,
    });
    if (saved) {
      renderFamilyCompositionRows(latestFamilyCompositionRows);
      renderFamilyCompositionRestoreModalList();
      if (deletedKeys.size === 0) {
        closeFamilyCompositionRestoreModal();
      }
      showToast("Member restored.", "success", 2500);
    } else {
      showToast("Unable to restore member right now.");
    }
  }

  async function handleFamilyCompositionResetClick() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      showToast("No active CSR selected.");
      return;
    }

    const confirmed = await confirmUserAction(
      "Are you sure you want to restore member data?"
    );
    if (!confirmed) {
      return;
    }

    if (familyCompositionAutoSaveTimer) {
      window.clearTimeout(familyCompositionAutoSaveTimer);
      familyCompositionAutoSaveTimer = null;
    }

    const preservedDeletedMemberKeys = Array.from(getFamilyCompositionDeletedKeysStore());
    const currentMembers = collectFamilyCompositionEditsFromDom();
    const addedMembers = getFamilyCompositionAddedMembersStore();
    const currentProfileOverrides = getFamilyCompositionProfileOverridesStore();
    const rowsByKey = new Map(
      latestFamilyCompositionRows
        .map((row) => [getFamilyCompositionMemberKey(row), row])
        .filter(([memberKey]) => Boolean(memberKey))
    );
    const nextMembers = {};
    let resetCount = 0;
    const workflowType = getActiveRecordWorkflowType();

    Object.keys(currentMembers).forEach((memberKey) => {
      const currentEntry =
        currentMembers[memberKey] && typeof currentMembers[memberKey] === "object"
          ? currentMembers[memberKey]
          : {};
      const row = rowsByKey.get(memberKey);
      if (!row) {
        const addedMember = addedMembers.find(
          (member) => getFamilyCompositionMemberKey(member) === memberKey
        );
        if (addedMember && addedMember.defaults && typeof addedMember.defaults === "object") {
          nextMembers[memberKey] = cloneJsonValue(addedMember.defaults) || {};
          resetCount += 1;
        } else {
          nextMembers[memberKey] = currentEntry;
        }
        return;
      }

      const defaultEntry = buildFamilyCompositionDefaultEntry(row);
      const nextEntry = {};
      Object.keys(currentEntry).forEach((fieldName) => {
        const value = normalizeText(currentEntry[fieldName]);
        if (!FAMILY_COMPOSITION_EDITABLE_FIELDS.includes(fieldName)) {
          nextEntry[fieldName] = value;
          return;
        }
        if (shouldPreserveFamilyCompositionFieldOnReset(fieldName, workflowType)) {
          nextEntry[fieldName] = value;
          return;
        }
        const defaultValue = normalizeText(defaultEntry[fieldName]);
        if (value !== defaultValue) {
          resetCount += 1;
          return;
        }
        nextEntry[fieldName] = value;
      });

      if (Object.keys(nextEntry).length > 0) {
        nextMembers[memberKey] = nextEntry;
      }
    });
    const nextProfileOverrides = {};
    Object.keys(currentProfileOverrides).forEach((memberKey) => {
      const row = rowsByKey.get(memberKey);
      if (!row) {
        nextProfileOverrides[memberKey] = currentProfileOverrides[memberKey];
      } else {
        resetCount += 1;
      }
    });

    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members: nextMembers,
      addedMembers,
      memberProfileOverrides: nextProfileOverrides,
      deletedMemberKeys: preservedDeletedMemberKeys,
      savedAt: new Date().toISOString(),
      lastSaveMode: "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const snapshot = buildRecordSyncSnapshot(currentCsrRecord, {
        includeFamilyComposition: true,
      });
      if (snapshot) {
        void enqueueCrossWorkflowSync(() =>
          syncRecordToCounterpartWorkflow(snapshot, {
            syncFamilyComposition: true,
            sourceSavedAt: normalizeText(
              snapshot &&
              snapshot.familyComposition &&
              snapshot.familyComposition.savedAt
            ),
          })
        );
      }
      renderFamilyCompositionRows(latestFamilyCompositionRows);
      updateFamilyCompositionRestoreButtonVisibility();
      closeFamilyCompositionRestoreModal();
      setFamilyCompositionSaveStatus(
        `Reset ${formatSaveTimeLabel(currentCsrRecord.familyComposition.savedAt)}`,
        "success"
      );
      const resetMessage =
        resetCount > 0
          ? "Family Composition reset to original values."
          : "No changed Family Composition values to reset.";
      showToast(resetMessage, "success", 2800);
    } catch (_) {
      setFamilyCompositionSaveStatus("Reset failed", "error");
      showToast("Unable to reset Family Composition right now.");
    }
  }

  async function persistCaseDevelopmentDetails(options) {
    const config = {
      isAutoSave: true,
      showToastOnError: true,
      ...options,
    };
    if (
      !caseDevelopmentSummernoteReady ||
      !currentCsrRecord ||
      !currentCsrRecord.csrId ||
      normalizeWorkflowType(currentCsrRecord.workflowType || activeWorkflowType) !== "CSR"
    ) {
      return false;
    }

    const html = getCaseDevelopmentEditorHtml();
    const narrativeKey = getCurrentNarrativeRecordKey();
    const narrativeLabel = getCurrentNarrativeSectionLabel();
    currentCsrRecord[narrativeKey] = {
      ...(currentCsrRecord[narrativeKey] || {}),
      html,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(
        currentCsrRecord[narrativeKey] && currentCsrRecord[narrativeKey].savedAt
      );
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setCaseDevelopmentSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setCaseDevelopmentSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast(`Unable to save ${narrativeLabel} right now.`);
      }
      return false;
    }
  }

  async function persistScsrPresentingProblemDetails(options) {
    const config = {
      isAutoSave: true,
      showToastOnError: true,
      ...options,
    };
    if (
      !caseDevelopmentSummernoteReady ||
      !isActiveScsrPresentingProblemRecord()
    ) {
      return false;
    }

    const html = getScsrPresentingProblemEditorHtml();
    currentCsrRecord.presentingProblem = {
      ...(currentCsrRecord.presentingProblem || {}),
      html,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(
        currentCsrRecord.presentingProblem && currentCsrRecord.presentingProblem.savedAt
      );
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setCaseDevelopmentSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setCaseDevelopmentSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Presenting Problem right now.");
      }
      return false;
    }
  }

  async function persistScsrBackgroundDetails(options) {
    const config = {
      isAutoSave: true,
      showToastOnError: true,
      ...options,
    };
    if (
      !scsrBackgroundSummernoteReady ||
      !isActiveScsrBackgroundRecord()
    ) {
      return false;
    }

    const safeTabKey = isValidScsrBackgroundTabKey(activeScsrBackgroundTabKey)
      ? activeScsrBackgroundTabKey
      : SCSR_BACKGROUND_TABS[0].key;
    const html = getScsrBackgroundEditorHtml();
    const savedAt = new Date().toISOString();
    const existingStore = getScsrBackgroundRecordStore();
    const existingTabs = getScsrBackgroundTabsStore();
    currentCsrRecord.backgroundInformation = {
      ...existingStore,
      tabs: {
        ...existingTabs,
        [safeTabKey]: {
          ...(existingTabs[safeTabKey] || {}),
          html,
          savedAt,
          lastSaveMode: config.isAutoSave ? "autosave" : "manual",
        },
      },
      activeTab: safeTabKey,
      savedAt,
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setScsrBackgroundSaveStatus(`${saveLabel} ${formatSaveTimeLabel(savedAt)}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setScsrBackgroundSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Background Information right now.");
      }
      return false;
    }
  }

  async function persistScsrCaseAssessmentDetails(options) {
    const config = {
      isAutoSave: true,
      showToastOnError: true,
      ...options,
    };
    if (
      !scsrCaseAssessmentSummernoteReady ||
      !isActiveScsrCaseAssessmentRecord()
    ) {
      return false;
    }

    const html = getScsrCaseAssessmentEditorHtml();
    currentCsrRecord.caseAssessment = {
      ...(currentCsrRecord.caseAssessment || {}),
      html,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(
        currentCsrRecord.caseAssessment && currentCsrRecord.caseAssessment.savedAt
      );
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setScsrCaseAssessmentSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setScsrCaseAssessmentSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Case Assessment right now.");
      }
      return false;
    }
  }

  async function persistScsrCaseManagementEvaluationDetails(options) {
    const config = {
      isAutoSave: true,
      showToastOnError: true,
      ...options,
    };
    if (
      !scsrCaseManagementEvaluationSummernoteReady ||
      !isActiveScsrCaseManagementEvaluationRecord()
    ) {
      return false;
    }

    const html = getScsrCaseManagementEvaluationEditorHtml();
    currentCsrRecord.caseManagementEvaluation = {
      ...(currentCsrRecord.caseManagementEvaluation || {}),
      html,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(
        currentCsrRecord.caseManagementEvaluation &&
        currentCsrRecord.caseManagementEvaluation.savedAt
      );
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setScsrCaseManagementEvaluationSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setScsrCaseManagementEvaluationSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Case Management Evaluation right now.");
      }
      return false;
    }
  }

  function handleCaseDevelopmentBackClick() {
    if (activeWorkflowType === "SCSR") {
      if (scsrPresentingProblemAutoSaveTimer) {
        window.clearTimeout(scsrPresentingProblemAutoSaveTimer);
        scsrPresentingProblemAutoSaveTimer = null;
      }
      void persistScsrPresentingProblemDetails({ isAutoSave: true, showToastOnError: false });
      setActiveCsrStep(2);
      return;
    }
    if (caseDevelopmentAutoSaveTimer) {
      window.clearTimeout(caseDevelopmentAutoSaveTimer);
      caseDevelopmentAutoSaveTimer = null;
    }
    void persistCaseDevelopmentDetails({ isAutoSave: true, showToastOnError: false });
    setActiveCsrStep(2);
  }

  function handleScsrBackgroundBackClick() {
    if (!isActiveScsrBackgroundRecord()) {
      setActiveCsrStep(3);
      return;
    }
    if (scsrBackgroundAutoSaveTimer) {
      window.clearTimeout(scsrBackgroundAutoSaveTimer);
      scsrBackgroundAutoSaveTimer = null;
    }
    void persistScsrBackgroundDetails({ isAutoSave: true, showToastOnError: false });
    setActiveCsrStep(3);
  }

  function handleScsrCaseAssessmentBackClick() {
    if (scsrCaseAssessmentAutoSaveTimer) {
      window.clearTimeout(scsrCaseAssessmentAutoSaveTimer);
      scsrCaseAssessmentAutoSaveTimer = null;
    }
    void persistScsrCaseAssessmentDetails({ isAutoSave: true, showToastOnError: false });
    setActiveCsrStep(4);
  }

  function handleScsrCaseManagementEvaluationBackClick() {
    if (scsrCaseManagementEvaluationAutoSaveTimer) {
      window.clearTimeout(scsrCaseManagementEvaluationAutoSaveTimer);
      scsrCaseManagementEvaluationAutoSaveTimer = null;
    }
    void persistScsrCaseManagementEvaluationDetails({ isAutoSave: true, showToastOnError: false });
    setActiveCsrStep(6);
  }

  function handleScsrBackgroundTabClick(event) {
    const button = event.target.closest("[data-scsr-background-tab]");
    if (!button || !scsrBackgroundTabList || !scsrBackgroundTabList.contains(button)) {
      return;
    }
    const tabKey = normalizeText(button.getAttribute("data-scsr-background-tab"));
    if (!isValidScsrBackgroundTabKey(tabKey)) {
      return;
    }
    void switchScsrBackgroundTab(tabKey);
  }

  async function switchScsrBackgroundTab(tabKey) {
    if (!isValidScsrBackgroundTabKey(tabKey) || tabKey === activeScsrBackgroundTabKey) {
      return;
    }
    if (isActiveScsrBackgroundRecord()) {
      setScsrBackgroundEditorHtml(getScsrBackgroundEditorHtml());
      const saved = await persistScsrBackgroundDetails({
        isAutoSave: true,
        showToastOnError: false,
      });
      if (!saved) {
        showToast("Unable to switch tab because save failed.");
        return;
      }
    }
    normalizeScsrBackgroundTabsStoreInMemory();
    activeScsrBackgroundTabKey = tabKey;
    renderScsrBackgroundTabs();
    const nextEntry = getScsrBackgroundTabEntry(tabKey);
    setScsrBackgroundEditorHtml(nextEntry.html || "");
    setScsrBackgroundFieldError(!normalizeText(getScsrBackgroundEditorHtml()));
    const savedAt = normalizeText(nextEntry.savedAt);
    if (savedAt) {
      const mode = normalizeText(nextEntry.lastSaveMode);
      const label = mode === "autosave" ? "Auto-saved" : "Saved";
      setScsrBackgroundSaveStatus(`${label} ${formatSaveTimeLabel(savedAt)}`, "success");
    } else {
      setScsrBackgroundSaveStatus("", "neutral");
    }
  }

  function isActiveCsrPrefillRequest(targetCsrId, requestSeq) {
    if (requestSeq !== basicInfoPrefillRequestSeq) {
      return false;
    }
    const activeCsrId = String(
      currentCsrRecord && typeof currentCsrRecord.csrId !== "undefined"
        ? currentCsrRecord.csrId
        : ""
    );
    return activeCsrId && activeCsrId === String(targetCsrId || "");
  }

  function setBasicInfoPrefillLoading(isLoading) {
    if (!basicInfoPrefillSpinner) {
      return;
    }
    basicInfoPrefillSpinner.classList.toggle("hidden", !isLoading);
  }

  function findGranteeRowForBasicInfo(rows, hhid, nameUpper) {
    if (!Array.isArray(rows)) {
      return null;
    }

    const normalizedHhId = normalizeText(hhid);
    const granteeRows = rows.filter(
      (row) => normalizeText(row && row.GRANTEE).toUpperCase() === "YES"
    );

    if (normalizedHhId) {
      const byHhId = granteeRows.find(
        (row) => normalizeText(row && row.HH_ID) === normalizedHhId
      );
      if (byHhId) {
        return byHhId;
      }
    }

    if (nameUpper) {
      const byName = granteeRows.find(
        (row) =>
          normalizeText(row && (row.NAME || row.NAMES)).toUpperCase() === nameUpper
      );
      if (byName) {
        return byName;
      }
    }

    // Fallback for municipality files where GRANTEE is missing/inconsistent.
    if (normalizedHhId) {
      const byHhIdAny = rows.find(
        (row) => normalizeText(row && row.HH_ID) === normalizedHhId
      );
      if (byHhIdAny) {
        return byHhIdAny;
      }
    }

    if (nameUpper) {
      const byNameAny = rows.find(
        (row) =>
          normalizeText(row && (row.NAME || row.NAMES)).toUpperCase() === nameUpper
      );
      if (byNameAny) {
        return byNameAny;
      }
    }

    return null;
  }

  function buildBasicInfoPrefilledFromGranteeRow(granteeRow, workflowType) {
    const isScsrWorkflow = normalizeWorkflowType(workflowType) === "SCSR";
    const nextPrefilled = {
      name: normalizeText(granteeRow && (granteeRow.NAME || granteeRow.NAMES)),
      hhid: normalizeText(granteeRow && granteeRow.HH_ID),
      hhSet: normalizeText(granteeRow && granteeRow.HH_SET),
      sex: resolveBasicSexValue(
        normalizeText(granteeRow && granteeRow.SEX)
      ),
      birthday: normalizeText(granteeRow && granteeRow.BIRTHDAY),
      age: normalizeText(granteeRow && granteeRow.AGE),
      civilStatus: resolveBasicCivilStatusValue(
        normalizeText(granteeRow && granteeRow.CIVIL_STATUS)
      ),
      ipAffiliation: normalizeText(granteeRow && granteeRow.IP_AFFILIATION) || "NONE",
      contactInfo: normalizeText(granteeRow && granteeRow["CONTACT NUMBER"]),
      nationalId: normalizeText(granteeRow && granteeRow.PCN),
      presentAddress: normalizeText(granteeRow && granteeRow.PRESENT_ADDRESS),
      religion: normalizeText(granteeRow && granteeRow.RELIGION),
      yearOfRegistration: normalizeText(granteeRow && granteeRow["YEAR OF REGISTRATION"]),
      yearsInProgram: normalizeText(granteeRow && granteeRow.YEARS_IN_PROGRAM),
      educationalAttainment: normalizeText(granteeRow && granteeRow.GRADE_LEVEL),
      clientStatusOnExit: normalizeText(granteeRow && granteeRow.CLIENT_STATUS),
      lowb: normalizeText(granteeRow && granteeRow.LOWB),
      prevWellBeingLevel: buildPrevWellBeingLabel(
        granteeRow && granteeRow.LOWB,
        granteeRow && granteeRow["SWDI SCORE"]
      ),
    };
    if (!isScsrWorkflow) {
      delete nextPrefilled.lowb;
      delete nextPrefilled.religion;
    } else {
      delete nextPrefilled.contactInfo;
      delete nextPrefilled.religion;
      delete nextPrefilled.lowb;
      delete nextPrefilled.presentAddress;
    }
    return nextPrefilled;
  }

  async function fetchLatestBasicInfoPrefilledForRecord(record, workflowType) {
    const municipality = normalizeText(
      record &&
      record.cardData &&
      record.cardData.municipality
    ).toUpperCase();
    const hhid = normalizeText(record && record.cardData && record.cardData.hhid);
    const nameUpper = normalizeText(record && record.cardData && record.cardData.name).toUpperCase();
    if (!municipality || (!hhid && !nameUpper)) {
      return null;
    }
    try {
      const municipalityRows = await loadMunicipalityRecordsForCards(municipality);
      const granteeRow = findGranteeRowForBasicInfo(municipalityRows, hhid, nameUpper);
      if (!granteeRow) {
        return null;
      }
      const prefilledWorkflowType =
        normalizeWorkflowType(workflowType) === "SCSR" ? "CSR" : workflowType;
      return buildBasicInfoPrefilledFromGranteeRow(granteeRow, prefilledWorkflowType);
    } catch (_) {
      return null;
    }
  }

  function fillBasicInfoLeftFields(granteeRow) {
    const isScsr = getActiveRecordWorkflowType() === "SCSR";
    const safeValue = (value) => normalizeText(value);

    if (basicGranteeNameInput) {
      basicGranteeNameInput.value = safeValue(granteeRow && (granteeRow.NAME || granteeRow.NAMES));
    }
    if (basicHhIdInput) {
      basicHhIdInput.value = safeValue(granteeRow && granteeRow.HH_ID);
    }
    if (basicHhSetInput) {
      basicHhSetInput.value = safeValue(granteeRow && granteeRow.HH_SET);
    }
    setBasicSexValue(safeValue(granteeRow && granteeRow.SEX), "");
    applyBasicInfoBirthdayAndAgeValues(
      safeValue(granteeRow && granteeRow.BIRTHDAY),
      safeValue(granteeRow && granteeRow.AGE)
    );
    setBasicCivilStatusValue(
      safeValue(granteeRow && granteeRow.CIVIL_STATUS),
      ""
    );
    if (basicIpAffiliationInput) {
      const ipAffiliation = safeValue(granteeRow && granteeRow.IP_AFFILIATION);
      basicIpAffiliationInput.value = ipAffiliation || "NONE";
    }
    if (basicClientStatusOnExitInput) {
      basicClientStatusOnExitInput.value = safeValue(granteeRow && granteeRow.CLIENT_STATUS);
    }
    setEducationalAttainmentFieldValue(granteeRow && granteeRow.GRADE_LEVEL, true);
    const nationalIdField = document.getElementById("edit-national-id");
    if (!isScsr && nationalIdField && !normalizeText(nationalIdField.value)) {
      nationalIdField.value = formatNationalId(safeValue(granteeRow && granteeRow.PCN));
    }
    const prefilledPrevWellBeing = isScsr
      ? normalizeScsrWellBeingLabel(safeValue(granteeRow && granteeRow.LOWB))
      : buildPrevWellBeingLabel(
          granteeRow && granteeRow.LOWB,
          granteeRow && granteeRow["SWDI SCORE"]
        );
    const editPrevWellBeingField = document.getElementById("edit-prev-wellbeing");
    if (editPrevWellBeingField && !normalizeText(editPrevWellBeingField.value)) {
      editPrevWellBeingField.value = prefilledPrevWellBeing;
    }

    const rowYearOfRegistration = safeValue(granteeRow && granteeRow["YEAR OF REGISTRATION"]);
    const yearField = document.getElementById("edit-year-registration");
    if (!isScsr && yearField && !normalizeText(yearField.value)) {
      yearField.value = rowYearOfRegistration;
    }

    const yearsInProgramField = document.getElementById("edit-years-program");
    if (!isScsr && yearsInProgramField && !normalizeText(yearsInProgramField.value)) {
      yearsInProgramField.value = safeValue(granteeRow && granteeRow.YEARS_IN_PROGRAM)
        .replace(/\D/g, "")
        .slice(0, 2);
    }

    const contactField = document.getElementById("edit-contact-info");
    if (shouldPrefillContactInfoField(contactField)) {
      const normalizedContact = normalizeContactInfoFromGrantee(
        safeValue(granteeRow && granteeRow["CONTACT NUMBER"])
      );
      if (normalizedContact) {
        contactField.value = normalizedContact;
      }
    }

    const presentAddressField = document.getElementById("edit-present-address");
    if (presentAddressField && !normalizeText(presentAddressField.value)) {
      presentAddressField.value = formatPresentAddressForDisplay(
        safeValue(granteeRow && granteeRow.PRESENT_ADDRESS)
      );
    }

    const rowReligion = safeValue(granteeRow && granteeRow.RELIGION);
    const religionField = document.getElementById("edit-religion");
    if (
      religionField &&
      rowReligion &&
      (isBasicInfoFieldEmpty(religionField) || !normalizeText(religionField.value)) &&
      isReligionOptionAvailable(religionField, rowReligion)
    ) {
      religionField.value = rowReligion;
    }
  }

  function hasCachedBasicInfoPrefilled(prefilled) {
    if (!prefilled || typeof prefilled !== "object") {
      return false;
    }

    const keys = [
      "name",
      "hhid",
      "hhSet",
      "sex",
      "birthday",
      "age",
      "civilStatus",
      "ipAffiliation",
      "contactInfo",
      "nationalId",
      "presentAddress",
      "educationalAttainment",
      "religion",
      "yearOfRegistration",
      "yearsInProgram",
      "clientStatusOnExit",
      "prevWellBeingLevel",
    ];
    return keys.some((key) => normalizeText(prefilled[key]).length > 0);
  }

  function hasCompleteBasicInfoPrefilled(prefilled) {
    if (!hasCachedBasicInfoPrefilled(prefilled)) {
      return false;
    }
    const requiredMappedKeys = getActiveRecordWorkflowType() === "SCSR"
      ? ["clientStatusOnExit"]
      : ["clientStatusOnExit"];
    return requiredMappedKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(prefilled, key)
    );
  }

  function fillBasicInfoLeftFieldsFromPrefilled(prefilled) {
    const isScsr = getActiveRecordWorkflowType() === "SCSR";
    if (!prefilled || typeof prefilled !== "object") {
      fillBasicInfoLeftFields(null);
      return;
    }

    if (basicGranteeNameInput) {
      basicGranteeNameInput.value = normalizeText(prefilled.name);
    }
    if (basicHhIdInput) {
      basicHhIdInput.value = normalizeText(prefilled.hhid);
    }
    if (basicHhSetInput) {
      basicHhSetInput.value = normalizeText(prefilled.hhSet);
    }
    setBasicSexValue(normalizeText(prefilled.sex), "");
    applyBasicInfoBirthdayAndAgeValues(
      normalizeText(prefilled.birthday),
      normalizeText(prefilled.age)
    );
    setBasicCivilStatusValue(normalizeText(prefilled.civilStatus), "");
    if (basicIpAffiliationInput) {
      const ip = normalizeText(prefilled.ipAffiliation);
      basicIpAffiliationInput.value = ip || "NONE";
    }
    if (basicClientStatusOnExitInput) {
      basicClientStatusOnExitInput.value = normalizeText(prefilled.clientStatusOnExit);
    }
    setEducationalAttainmentFieldValue(prefilled.educationalAttainment, true);
    const nationalIdField = document.getElementById("edit-national-id");
    if (!isScsr && nationalIdField && !normalizeText(nationalIdField.value)) {
      nationalIdField.value = formatNationalId(normalizeText(prefilled.nationalId));
    }
    const editPrevWellBeingField = document.getElementById("edit-prev-wellbeing");
    if (editPrevWellBeingField && !normalizeText(editPrevWellBeingField.value)) {
      editPrevWellBeingField.value = isScsr
        ? normalizeScsrWellBeingLabel(prefilled.lowb)
        : normalizeText(prefilled.prevWellBeingLevel);
    }

    const yearField = document.getElementById("edit-year-registration");
    if (!isScsr && yearField && !normalizeText(yearField.value)) {
      yearField.value = normalizeText(prefilled.yearOfRegistration);
    }

    const yearsInProgramField = document.getElementById("edit-years-program");
    if (!isScsr && yearsInProgramField && !normalizeText(yearsInProgramField.value)) {
      yearsInProgramField.value = normalizeText(prefilled.yearsInProgram)
        .replace(/\D/g, "")
        .slice(0, 2);
    }

    const contactField = document.getElementById("edit-contact-info");
    if (shouldPrefillContactInfoField(contactField)) {
      const normalizedContact = normalizeContactInfoFromGrantee(prefilled.contactInfo);
      if (normalizedContact) {
        contactField.value = normalizedContact;
      }
    }

    const presentAddressField = document.getElementById("edit-present-address");
    if (presentAddressField && !normalizeText(presentAddressField.value)) {
      presentAddressField.value = formatPresentAddressForDisplay(prefilled.presentAddress);
    }

    const religionField = document.getElementById("edit-religion");
    const prefilledReligion = normalizeText(prefilled.religion);
    if (
      religionField &&
      prefilledReligion &&
      (isBasicInfoFieldEmpty(religionField) || !normalizeText(religionField.value)) &&
      isReligionOptionAvailable(religionField, prefilledReligion)
    ) {
      religionField.value = prefilledReligion;
    }
    refreshBasicInfoDatalistVisibility();
  }

  function handleReturnToSelectionClick() {
    flushBasicInfoAutoSave();
    hideCsrWorkspace();
    if (dataTableCard) {
      dataTableCard.classList.remove("hidden");
      if (typeof dataTableCard.scrollIntoView === "function") {
        dataTableCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setCsrViewState({ mode: "selection" });
  }

  function openCsrDb() {
    if (csrDbPromise) {
      return csrDbPromise;
    }

    csrDbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(CSR_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CSR_STORE_NAME)) {
          db.createObjectStore(CSR_STORE_NAME, { keyPath: "csrId" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB open failed."));
    });

    return csrDbPromise;
  }

  function getCsrViewState() {
    try {
      const raw = window.localStorage.getItem(CSR_VIEW_STATE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function setCsrViewState(state) {
    try {
      window.localStorage.setItem(CSR_VIEW_STATE_KEY, JSON.stringify(state));
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  function clearCsrViewState() {
    try {
      window.localStorage.removeItem(CSR_VIEW_STATE_KEY);
    } catch (_) {
      // Ignore storage failures and keep runtime flow working.
    }
  }

  async function getCsrRecordById(csrId, municipalityHint, workflowType) {
    if (!csrId) {
      return null;
    }
    const datasetKind = getDatasetKindFromWorkflowType(workflowType || activeWorkflowType);
    if (isHttpContext()) {
      const municipality = normalizeText(
        municipalityHint || getActiveMunicipalityForCards()
      ).toUpperCase();
      const byHint = await fetchServerCsrRecordById(csrId, municipality, datasetKind);
      if (byHint) {
        return byHint;
      }
      // Safe fallback: retry without municipality filter in case session/cache
      // state is stale across browser profiles.
      if (municipality) {
        const byIdOnly = await fetchServerCsrRecordById(csrId, "", datasetKind);
        if (byIdOnly) {
          return byIdOnly;
        }
      }
    }

    const db = await openCsrDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CSR_STORE_NAME, "readonly");
      const store = tx.objectStore(CSR_STORE_NAME);
      const request = store.get(String(csrId));
      request.onsuccess = () => {
        const result = request.result || null;
        if (!result) {
          resolve(null);
          return;
        }
        const recordKind = getDatasetKindFromWorkflowType(result.workflowType || "CSR");
        resolve(recordKind === datasetKind ? result : null);
      };
      request.onerror = () =>
        reject(request.error || new Error("Failed to load CSR record."));
    });
  }

  async function fetchServerCsrRecordById(csrId, municipality, kind) {
    if (!isHttpContext()) {
      return null;
    }
    const query = new URLSearchParams({ id: String(csrId) });
    query.set("kind", String(kind || "csr"));
    const safeMunicipality = normalizeText(municipality).toUpperCase();
    if (safeMunicipality) {
      query.set("municipality", safeMunicipality);
    }
    try {
      const response = await fetch(`/api/csr/by-id?${query.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      if (payload && payload.ok && payload.record) {
        return payload.record;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  async function getServerCsrRecordsByMunicipality(municipality, kind) {
    const safeMunicipality = normalizeText(municipality).toUpperCase();
    if (!safeMunicipality || !isHttpContext()) {
      return null;
    }
    try {
      const query = new URLSearchParams({
        municipality: safeMunicipality,
        kind: String(kind || "csr"),
      });
      const response = await fetch(`/api/csr?${query.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      if (!payload || !payload.ok || !Array.isArray(payload.records)) {
        return null;
      }
      return payload.records;
    } catch (_) {
      return null;
    }
  }

  async function saveServerCsrRecord(municipality, record, kind) {
    const safeMunicipality = normalizeText(municipality).toUpperCase();
    if (!safeMunicipality || !isHttpContext()) {
      return false;
    }
    try {
      const response = await fetch("/api/csr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          municipality: safeMunicipality,
          kind: String(kind || "csr"),
          record: record,
        }),
      });
      return response.ok;
    } catch (_) {
      return false;
    }
  }

  function getRecordMunicipality(record) {
    return normalizeText(
      record &&
      record.cardData &&
      record.cardData.municipality
    ).toUpperCase();
  }

  function sanitizeRecordWorkflowIsolation(record) {
    if (!record || typeof record !== "object") {
      return { record, changed: false };
    }
    const workflowType = normalizeWorkflowType(record.workflowType || "CSR");
    const nextRecord = { ...record, workflowType };
    let changed = false;
    if (workflowType === "SCSR") {
      if (Object.prototype.hasOwnProperty.call(nextRecord, "recommendation")) {
        delete nextRecord.recommendation;
        changed = true;
      }
      const backgroundInformation =
        nextRecord.backgroundInformation && typeof nextRecord.backgroundInformation === "object"
          ? nextRecord.backgroundInformation
          : null;
      if (
        backgroundInformation &&
        backgroundInformation.tabs &&
        typeof backgroundInformation.tabs === "object"
      ) {
        const nextTabs = { ...backgroundInformation.tabs };
        let tabsMutated = false;
        if (Object.prototype.hasOwnProperty.call(nextTabs, "family")) {
          delete nextTabs.family;
          tabsMutated = true;
        }
        Object.keys(nextTabs).forEach((tabKey) => {
          const entry = nextTabs[tabKey];
          if (!entry || typeof entry !== "object") {
            return;
          }
          const normalizedHtml = normalizeCaseDevelopmentHtmlForStorage(entry.html);
          if (normalizedHtml !== normalizeText(entry.html)) {
            nextTabs[tabKey] = {
              ...entry,
              html: normalizedHtml,
            };
            tabsMutated = true;
          }
        });
        if (tabsMutated) {
          nextRecord.backgroundInformation = {
            ...backgroundInformation,
            tabs: nextTabs,
          };
          changed = true;
        }
      }
      const basicInformation =
        nextRecord.basicInformation && typeof nextRecord.basicInformation === "object"
          ? nextRecord.basicInformation
          : null;
      if (basicInformation) {
        const sanitizeBasicEntry = (entry) => {
          if (!entry || typeof entry !== "object") {
            return { entry, mutated: false };
          }
          const nextEntry = { ...entry };
          let mutated = false;
          if (normalizeText(nextEntry.prevWellBeingLevel) && !normalizeText(nextEntry.wellBeingLevel)) {
            nextEntry.wellBeingLevel = normalizeText(nextEntry.prevWellBeingLevel);
            mutated = true;
          }
          [
            "nationalId",
            "yearOfRegistration",
            "yearsInProgram",
            "prevWellBeingLevel",
          ].forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(nextEntry, key)) {
              delete nextEntry[key];
              mutated = true;
            }
          });
          return { entry: nextEntry, mutated };
        };

        const prefilled = sanitizeBasicEntry(basicInformation.prefilled);
        const editDetails = sanitizeBasicEntry(basicInformation.editDetails);
        if (
          editDetails.entry &&
          typeof editDetails.entry === "object" &&
          normalizeText(editDetails.entry.sourceOfInfo) &&
          !normalizeText(editDetails.entry.sourceOfIncome)
        ) {
          editDetails.entry.sourceOfIncome = normalizeText(editDetails.entry.sourceOfInfo);
          delete editDetails.entry.sourceOfInfo;
          editDetails.mutated = true;
        } else if (
          editDetails.entry &&
          typeof editDetails.entry === "object" &&
          Object.prototype.hasOwnProperty.call(editDetails.entry, "sourceOfInfo")
        ) {
          delete editDetails.entry.sourceOfInfo;
          editDetails.mutated = true;
        }
        if (
          prefilled.entry &&
          typeof prefilled.entry === "object" &&
          !normalizeText(prefilled.entry.educationalAttainment) &&
          editDetails.entry &&
          typeof editDetails.entry === "object" &&
          normalizeText(editDetails.entry.educationalAttainment)
        ) {
          prefilled.entry.educationalAttainment = normalizeText(
            editDetails.entry.educationalAttainment
          );
          prefilled.mutated = true;
        }
        if (
          prefilled.entry &&
          typeof prefilled.entry === "object" &&
          Object.prototype.hasOwnProperty.call(prefilled.entry, "monthlyIncome")
        ) {
          delete prefilled.entry.monthlyIncome;
          prefilled.mutated = true;
        }
        if (
          prefilled.entry &&
          typeof prefilled.entry === "object" &&
          Object.prototype.hasOwnProperty.call(prefilled.entry, "perCapitaIncome")
        ) {
          delete prefilled.entry.perCapitaIncome;
          prefilled.mutated = true;
        }
        if (
          prefilled.entry &&
          typeof prefilled.entry === "object" &&
          Object.prototype.hasOwnProperty.call(prefilled.entry, "contactInfo")
        ) {
          delete prefilled.entry.contactInfo;
          prefilled.mutated = true;
        }
        if (
          prefilled.entry &&
          typeof prefilled.entry === "object" &&
          Object.prototype.hasOwnProperty.call(prefilled.entry, "religion")
        ) {
          delete prefilled.entry.religion;
          prefilled.mutated = true;
        }
        if (
          prefilled.entry &&
          typeof prefilled.entry === "object" &&
          Object.prototype.hasOwnProperty.call(prefilled.entry, "lowb")
        ) {
          delete prefilled.entry.lowb;
          prefilled.mutated = true;
        }
        if (
          prefilled.entry &&
          typeof prefilled.entry === "object" &&
          Object.prototype.hasOwnProperty.call(prefilled.entry, "presentAddress")
        ) {
          delete prefilled.entry.presentAddress;
          prefilled.mutated = true;
        }
        if (
          editDetails.entry &&
          typeof editDetails.entry === "object" &&
          Object.prototype.hasOwnProperty.call(editDetails.entry, "clientStatusOnExit")
        ) {
          delete editDetails.entry.clientStatusOnExit;
          editDetails.mutated = true;
        }
        if (prefilled.mutated || editDetails.mutated) {
          nextRecord.basicInformation = {
            ...basicInformation,
            prefilled: prefilled.entry,
            editDetails: editDetails.entry,
          };
          changed = true;
        }
      }
    } else if (workflowType === "CSR") {
      const basicInformation =
        nextRecord.basicInformation && typeof nextRecord.basicInformation === "object"
          ? nextRecord.basicInformation
          : null;
      if (basicInformation) {
        let prefilledMutated = false;
        let editDetailsMutated = false;
        let nextPrefilled =
          basicInformation.prefilled && typeof basicInformation.prefilled === "object"
            ? { ...basicInformation.prefilled }
            : null;
        let nextEditDetails =
          basicInformation.editDetails && typeof basicInformation.editDetails === "object"
            ? { ...basicInformation.editDetails }
            : null;

        [
          "lowb",
          "monthlyIncome",
          "perCapitaIncome",
          "contactInfo",
          "nationalId",
          "presentAddress",
          "religion",
          "yearOfRegistration",
          "yearsInProgram",
          "educationalAttainment",
          "prevWellBeingLevel",
        ].forEach((key) => {
          if (nextPrefilled && Object.prototype.hasOwnProperty.call(nextPrefilled, key)) {
            delete nextPrefilled[key];
            prefilledMutated = true;
          }
        });

        ["monthlyIncome", "perCapitaIncome"].forEach((key) => {
          if (nextEditDetails && Object.prototype.hasOwnProperty.call(nextEditDetails, key)) {
            delete nextEditDetails[key];
            editDetailsMutated = true;
          }
        });

        if (prefilledMutated || editDetailsMutated) {
          nextRecord.basicInformation = {
            ...basicInformation,
            ...(prefilledMutated ? { prefilled: nextPrefilled } : {}),
            ...(editDetailsMutated ? { editDetails: nextEditDetails } : {}),
          };
          changed = true;
        }
      }
    } else if (Object.prototype.hasOwnProperty.call(nextRecord, "scsrRecommendation")) {
      delete nextRecord.scsrRecommendation;
      changed = true;
    }
    return { record: nextRecord, changed };
  }

  async function putCsrRecordLocalCache(record) {
    try {
      const db = await openCsrDb();
      await putCsrRecord(db, record);
    } catch (_) {
      // Ignore local cache failures; primary storage is file-based in HTTP mode.
    }
  }

  async function getPrimaryCsrRecordsForMunicipality(municipality, workflowType) {
    const safeMunicipality = normalizeText(municipality).toUpperCase();
    const datasetKind = getDatasetKindFromWorkflowType(workflowType || activeWorkflowType);
    if (!safeMunicipality) {
      return [];
    }

    if (isHttpContext()) {
      const serverRecords = await getServerCsrRecordsByMunicipality(
        safeMunicipality,
        datasetKind
      );
      if (Array.isArray(serverRecords)) {
        return serverRecords;
      }
    }

    const db = await openCsrDb();
    const localRecords = await getAllCsrRecords(db);
    return localRecords.filter(
      (record) =>
        getDatasetKindFromWorkflowType(record && record.workflowType) === datasetKind &&
        normalizeText(record && record.cardData && record.cardData.municipality).toUpperCase() ===
          safeMunicipality
    );
  }

  async function cleanupWorkflowIsolationForMunicipality(municipality, workflowType) {
    const normalizedWorkflow = normalizeWorkflowType(workflowType);
    const safeMunicipality = normalizeText(municipality).toUpperCase();
    if (!safeMunicipality) {
      return;
    }
    const cleanupKey = `${normalizedWorkflow}:${safeMunicipality}`;
    if (workflowIsolationCleanupDone.has(cleanupKey)) {
      return;
    }
    try {
      const records = await getPrimaryCsrRecordsForMunicipality(
        safeMunicipality,
        normalizedWorkflow
      );
      if (!Array.isArray(records) || !records.length) {
        workflowIsolationCleanupDone.add(cleanupKey);
        return;
      }
      const activeId = String(currentCsrRecord && currentCsrRecord.csrId ? currentCsrRecord.csrId : "");
      for (const record of records) {
        const sanitized = sanitizeRecordWorkflowIsolation(record);
        if (!sanitized.changed) {
          continue;
        }
        await saveCsrRecordToPrimaryStorage(sanitized.record);
        if (activeId && String(sanitized.record.csrId || "") === activeId) {
          currentCsrRecord = sanitized.record;
        }
      }
      workflowIsolationCleanupDone.add(cleanupKey);
    } catch (_) {
      // Ignore cleanup failures; main workflow remains available.
    }
  }

  async function saveCsrRecordToPrimaryStorage(record) {
    const sanitized = sanitizeRecordWorkflowIsolation(record);
    const safeRecord = sanitized.record;
    const municipality = getRecordMunicipality(safeRecord);
    const datasetKind = getDatasetKindFromWorkflowType(safeRecord && safeRecord.workflowType);
    let savedToPrimary = false;

    if (isHttpContext() && municipality) {
      savedToPrimary = await saveServerCsrRecord(municipality, safeRecord, datasetKind);
    } else if (!isHttpContext()) {
      const db = await openCsrDb();
      await putCsrRecord(db, safeRecord);
      savedToPrimary = true;
    }

    await putCsrRecordLocalCache(safeRecord);
    return savedToPrimary || !isHttpContext();
  }

  async function restoreCsrWorkspaceFromViewState() {
    const viewState = getCsrViewState();
    if (!viewState || viewState.mode !== "workspace") {
      return false;
    }
    const workflowType = normalizeWorkflowType(viewState.workflowType);

    const csrId = String(viewState.csrId || "").trim();
    if (!csrId) {
      clearCsrViewState();
      return false;
    }

    try {
      const savedRecord = await getCsrRecordById(csrId, "", workflowType);
      if (!savedRecord) {
        clearCsrViewState();
        return false;
      }
      const requestedStep = Number(viewState.activeStep || savedRecord.activeStep || 1);
      return openCsrWorkspaceFromRecord(savedRecord, requestedStep, workflowType);
    } catch (_) {
      clearCsrViewState();
      return false;
    }
  }

  async function restoreCsrWorkspaceFromDeepLink(deepLink) {
    if (!deepLink || !deepLink.csrId) {
      return false;
    }

    const activeMunicipality = getActiveMunicipalityForCards();
    const targetMunicipality = normalizeText(deepLink.municipality).toUpperCase();
    if (
      targetMunicipality &&
      activeMunicipality &&
      targetMunicipality !== activeMunicipality
    ) {
      showToast(
        `Deep-link municipality mismatch. Logged in as ${activeMunicipality}.`,
        "error",
        3200
      );
      return false;
    }

    try {
      const savedRecord = await getCsrRecordById(
        deepLink.csrId,
        targetMunicipality || activeMunicipality,
        "CSR"
      );
      if (!savedRecord) {
        showToast(
          `CSR ${deepLink.csrId} was not found for your current session.`,
          "error",
          3200
        );
        return false;
      }
      const requestedStep = Number(savedRecord.activeStep || 1);
      const opened = await openCsrWorkspaceFromRecord(savedRecord, requestedStep, "CSR");
      if (opened) {
        showToast(`CSR ${deepLink.csrId} opened from link.`, "success", 2200);
      }
      return opened;
    } catch (_) {
      showToast("Unable to open CSR from link right now.", "error", 3200);
      return false;
    }
  }

  async function openCsrWorkspaceFromRecord(savedRecord, requestedStep, workflowType) {
    if (!savedRecord || !savedRecord.csrId) {
      return false;
    }
    if (currentCsrRecord && currentCsrRecord.csrId) {
      flushAllAutoSaveQueues();
    }
    const normalizedWorkflowType = normalizeWorkflowType(
      workflowType || savedRecord.workflowType || "CSR"
    );
    const municipality = normalizeText(
      savedRecord && savedRecord.cardData && savedRecord.cardData.municipality
    ).toUpperCase();
    await cleanupWorkflowIsolationForMunicipality(municipality, normalizedWorkflowType);
    setWorkflowType(normalizedWorkflowType);
    const hydratedRecord = await hydrateRecordFromCounterpartWorkflow(savedRecord);
    currentCsrRecord = sanitizeRecordWorkflowIsolation(hydratedRecord).record;
    applySavedBasicInfoEditDetails();
    applySavedCaseDevelopmentDetails();
    applySavedScsrBackgroundDetails();
    applySavedScsrCaseAssessmentDetails();
    applySavedScsrPlanImplementationDetails();
    applySavedScsrCaseManagementEvaluationDetails();
    applySavedScsrRecommendationDetails();
    applySavedInterventionsProvidedDetails();
    applySavedHouseholdInterventionPlanDetails();
    applySavedRecommendationDetails();
    showCsrWorkspace();
    const resolvedStep =
      Number.isInteger(requestedStep) &&
      requestedStep >= 1 &&
      requestedStep <= getCurrentWorkflowStepCount()
        ? requestedStep
        : 1;
    setActiveCsrStep(resolvedStep);
    setCsrViewState({
      mode: "workspace",
      csrId: String(savedRecord.csrId || ""),
      workflowType: normalizedWorkflowType,
      activeStep: resolvedStep,
    });
    void populateBasicInfoFromSelectedCard(
      savedRecord && savedRecord.cardData,
      savedRecord && savedRecord.csrId
    );
    if (normalizedWorkflowType === "CSR") {
      void populateFamilyCompositionFromSelectedCard(
        savedRecord && savedRecord.cardData
      );
    }
    return true;
  }

  function getAllCsrRecords(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CSR_STORE_NAME, "readonly");
      const store = tx.objectStore(CSR_STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(Array.isArray(request.result) ? request.result : []);
      };
      request.onerror = () => reject(request.error || new Error("Failed to read CSR records."));
    });
  }

  function normalizeCsrKeyPart(value) {
    return normalizeText(value).toUpperCase();
  }

  function buildHouseholdKey(cardData) {
    const municipality = normalizeCsrKeyPart(cardData && cardData.municipality);
    const hhid = normalizeCsrKeyPart(cardData && cardData.hhid);
    if (hhid) {
      return `${municipality}|${hhid}`;
    }

    const name = normalizeCsrKeyPart(cardData && cardData.name);
    const barangay = normalizeCsrKeyPart(cardData && cardData.barangay);
    return `${municipality}|${name}|${barangay}`;
  }

  function getCounterpartWorkflowType(workflowType) {
    return normalizeWorkflowType(workflowType) === "SCSR" ? "CSR" : "SCSR";
  }

  function setBasicInfoSyncAuditMetadata(basicInformation, changedFieldKeys, options) {
    const safeBasicInformation =
      basicInformation && typeof basicInformation === "object" ? basicInformation : {};
    const keys = Array.isArray(changedFieldKeys)
      ? changedFieldKeys.map((value) => normalizeText(value)).filter(Boolean)
      : [];
    if (!keys.length) {
      return safeBasicInformation;
    }
    const config = {
      sourceWorkflow: "",
      sourceCsrId: "",
      updatedAt: new Date().toISOString(),
      syncMode: "auto-sync",
      ...options,
    };
    const existingAudit =
      safeBasicInformation.syncAudit && typeof safeBasicInformation.syncAudit === "object"
        ? safeBasicInformation.syncAudit
        : {};
    const existingFields =
      existingAudit.sharedFields && typeof existingAudit.sharedFields === "object"
        ? existingAudit.sharedFields
        : {};
    const nextSharedFields = {
      ...existingFields,
    };
    const sourceWorkflowRaw = normalizeText(config.sourceWorkflow).toUpperCase();
    const sourceWorkflow =
      sourceWorkflowRaw === "SCSR" || sourceWorkflowRaw === "CSR"
        ? sourceWorkflowRaw
        : "";
    const updatedAt = normalizeText(config.updatedAt) || new Date().toISOString();
    keys.forEach((fieldKey) => {
      nextSharedFields[fieldKey] = {
        lastUpdatedByWorkflow: sourceWorkflow,
        updatedAt,
        sourceCsrId: normalizeText(config.sourceCsrId),
        syncMode: normalizeText(config.syncMode) || "auto-sync",
      };
    });
    return {
      ...safeBasicInformation,
      syncAudit: {
        ...existingAudit,
        sharedFields: nextSharedFields,
        lastUpdatedByWorkflow: sourceWorkflow,
        lastUpdatedAt: updatedAt,
        lastSourceCsrId: normalizeText(config.sourceCsrId),
        lastSyncMode: normalizeText(config.syncMode) || "auto-sync",
      },
    };
  }

  function setFamilyCompositionSyncAuditMetadata(familyComposition, options) {
    const safeFamilyComposition =
      familyComposition && typeof familyComposition === "object"
        ? familyComposition
        : {};
    const config = {
      sourceWorkflow: "",
      sourceCsrId: "",
      updatedAt: new Date().toISOString(),
      syncMode: "auto-sync",
      ...options,
    };
    const existingAudit =
      safeFamilyComposition.syncAudit && typeof safeFamilyComposition.syncAudit === "object"
        ? safeFamilyComposition.syncAudit
        : {};
    const sourceWorkflowRaw = normalizeText(config.sourceWorkflow).toUpperCase();
    const sourceWorkflow =
      sourceWorkflowRaw === "SCSR" || sourceWorkflowRaw === "CSR"
        ? sourceWorkflowRaw
        : "";
    const updatedAt = normalizeText(config.updatedAt) || new Date().toISOString();
    return {
      ...safeFamilyComposition,
      syncAudit: {
        ...existingAudit,
        lastUpdatedByWorkflow: sourceWorkflow,
        lastUpdatedAt: updatedAt,
        lastSourceCsrId: normalizeText(config.sourceCsrId),
        lastSyncMode: normalizeText(config.syncMode) || "auto-sync",
      },
    };
  }

  function normalizeSharedBasicFieldValue(fieldName, value) {
    const normalized = normalizeText(value);
    if (!normalized) {
      return "";
    }
    if (fieldName === "sex") {
      return resolveBasicSexValue(normalized);
    }
    if (fieldName === "birthday") {
      return toFamilyCompositionBirthdayIso(normalized);
    }
    if (fieldName === "civilStatus") {
      return resolveBasicCivilStatusValue(normalized);
    }
    if (fieldName === "educationalAttainment" || fieldName === "religion") {
      if (normalized.toUpperCase().startsWith("SELECT")) {
        return "";
      }
      return normalized;
    }
    if (fieldName === "contactInfo") {
      const normalizedContact = normalizeContactInfoForStorage(normalized);
      return normalizedContact === "NONE" ? "" : normalizedContact;
    }
    return normalized;
  }

  function extractSharedBasicInfoPayload(editDetails) {
    const safeEntry = editDetails && typeof editDetails === "object" ? editDetails : {};
    const payload = {};
    CROSS_WORKFLOW_SHARED_BASIC_FIELDS.forEach((fieldName) => {
      payload[fieldName] = normalizeSharedBasicFieldValue(fieldName, safeEntry[fieldName]);
    });
    return payload;
  }

  function cloneJsonValue(value) {
    if (typeof value === "undefined") {
      return undefined;
    }
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return undefined;
    }
  }

  function buildRecordSyncSnapshot(record, options) {
    const config = {
      includeBasicInfo: false,
      includeFamilyComposition: false,
      ...options,
    };
    if (!record || !record.csrId) {
      return null;
    }
    const snapshot = {
      csrId: String(record.csrId || ""),
      workflowType: normalizeWorkflowType(record.workflowType || activeWorkflowType),
      cardData: {
        ...(record.cardData || {}),
      },
    };
    if (config.includeBasicInfo) {
      const basicInformation =
        record.basicInformation && typeof record.basicInformation === "object"
          ? record.basicInformation
          : null;
      snapshot.basicInformation = {
        ...(basicInformation || {}),
        editDetails: cloneJsonValue(basicInformation && basicInformation.editDetails) || {},
      };
    }
    if (config.includeFamilyComposition) {
      const clonedFamily = cloneJsonValue(record.familyComposition);
      snapshot.familyComposition =
        clonedFamily && typeof clonedFamily === "object" ? clonedFamily : {};
    }
    return snapshot;
  }

  function enqueueCrossWorkflowSync(task) {
    if (typeof task !== "function") {
      return Promise.resolve(false);
    }
    crossWorkflowSyncQueue = crossWorkflowSyncQueue
      .catch(() => null)
      .then(() => task())
      .catch(() => false);
    return crossWorkflowSyncQueue;
  }

  function applySharedBasicInfoToRecord(record, sharedBasicInfo, options) {
    const config = {
      onlyIfEmpty: false,
      savedAt: "",
      lastSaveMode: "autosave",
      sourceWorkflow: "",
      sourceCsrId: "",
      syncMode: "auto-sync",
      ...options,
    };
    if (!record || typeof record !== "object") {
      return { record, changed: false };
    }
    const sourcePayload = extractSharedBasicInfoPayload(sharedBasicInfo);
    const hasSourceValue = CROSS_WORKFLOW_SHARED_BASIC_FIELDS.some(
      (fieldName) => normalizeText(sourcePayload[fieldName]).length > 0
    );
    if (!hasSourceValue) {
      return { record, changed: false };
    }
    const basicInformation =
      record.basicInformation && typeof record.basicInformation === "object"
        ? record.basicInformation
        : {};
    const existingEditDetails =
      basicInformation.editDetails && typeof basicInformation.editDetails === "object"
        ? basicInformation.editDetails
        : {};
    const nextEditDetails = {
      ...existingEditDetails,
    };
    const currentPayload = extractSharedBasicInfoPayload(existingEditDetails);
    let changed = false;
    const changedFieldKeys = [];

    CROSS_WORKFLOW_SHARED_BASIC_FIELDS.forEach((fieldName) => {
      const nextValue = normalizeText(sourcePayload[fieldName]);
      const currentValue = normalizeText(currentPayload[fieldName]);
      if (!nextValue) {
        return;
      }
      if (config.onlyIfEmpty && currentValue) {
        return;
      }
      if (currentValue === nextValue) {
        return;
      }
      nextEditDetails[fieldName] = nextValue;
      changed = true;
      changedFieldKeys.push(fieldName);
    });

    if (!changed) {
      return { record, changed: false };
    }

    const savedAt = normalizeText(config.savedAt) || new Date().toISOString();
    const nextBasicInformation = setBasicInfoSyncAuditMetadata(
      {
        ...basicInformation,
        editDetails: nextEditDetails,
        savedAt,
        lastSaveMode: normalizeText(config.lastSaveMode) || "autosave",
      },
      changedFieldKeys,
      {
        sourceWorkflow: config.sourceWorkflow,
        sourceCsrId: config.sourceCsrId,
        updatedAt: savedAt,
        syncMode: config.syncMode,
      }
    );
    const nextRecord = {
      ...record,
      basicInformation: nextBasicInformation,
    };
    return { record: nextRecord, changed: true };
  }

  function normalizeSharedFamilyCompositionFieldValue(fieldName, value) {
    const safeField = normalizeText(fieldName);
    if (!safeField) {
      return "";
    }
    const normalized = normalizeFamilyCompositionFieldForStorage(safeField, value);
    if (safeField === "educationalAttainment") {
      const key = normalizeText(normalized).toUpperCase();
      if (!key || key.startsWith("SELECT")) {
        return "";
      }
    }
    return normalizeText(normalized);
  }

  function applySharedFamilyCompositionToRecord(record, familyComposition, options) {
    const config = {
      onlyIfEmpty: false,
      replaceEntireState: false,
      savedAt: "",
      lastSaveMode: "autosave",
      sourceWorkflow: "",
      sourceCsrId: "",
      syncMode: "auto-sync",
      ...options,
    };
    if (!record || typeof record !== "object") {
      return { record, changed: false };
    }
    const sourceStore =
      familyComposition && typeof familyComposition === "object"
        ? familyComposition
        : null;
    if (!sourceStore) {
      return { record, changed: false };
    }
    const sourceMembers =
      sourceStore.members && typeof sourceStore.members === "object"
        ? cloneJsonValue(sourceStore.members) || {}
        : {};
    const sourceAddedMembers = Array.isArray(sourceStore.addedMembers)
      ? cloneJsonValue(sourceStore.addedMembers) || []
      : [];
    const sourceProfileOverrides =
      sourceStore.memberProfileOverrides && typeof sourceStore.memberProfileOverrides === "object"
        ? cloneJsonValue(sourceStore.memberProfileOverrides) || {}
        : {};
    const sourceDeletedKeys = Array.isArray(sourceStore.deletedMemberKeys)
      ? sourceStore.deletedMemberKeys.map((item) => normalizeText(item)).filter(Boolean)
      : [];
    const sourceMemberKeys = Object.keys(sourceMembers);
    if (
      !config.replaceEntireState &&
      !sourceMemberKeys.length &&
      !sourceAddedMembers.length &&
      !Object.keys(sourceProfileOverrides).length
    ) {
      return { record, changed: false };
    }

    const existingStore =
      record.familyComposition && typeof record.familyComposition === "object"
        ? record.familyComposition
        : {};
    const existingMembers =
      existingStore.members && typeof existingStore.members === "object"
        ? existingStore.members
        : {};
    const nextMembers = config.replaceEntireState
      ? {}
      : cloneJsonValue(existingMembers) || {};
    let changed = false;

    if (config.replaceEntireState) {
      const existingAddedMembers = Array.isArray(existingStore.addedMembers)
        ? cloneJsonValue(existingStore.addedMembers) || []
        : [];
      const existingProfileOverrides =
        existingStore.memberProfileOverrides && typeof existingStore.memberProfileOverrides === "object"
          ? cloneJsonValue(existingStore.memberProfileOverrides) || {}
          : {};
      const existingDeletedKeys = Array.isArray(existingStore.deletedMemberKeys)
        ? existingStore.deletedMemberKeys.map((item) => normalizeText(item)).filter(Boolean)
        : [];
      const nextFamilyComposition = setFamilyCompositionSyncAuditMetadata(
        {
          ...existingStore,
          members: cloneJsonValue(sourceMembers) || {},
          addedMembers: sourceAddedMembers,
          memberProfileOverrides: sourceProfileOverrides,
          deletedMemberKeys: sourceDeletedKeys,
          savedAt: normalizeText(config.savedAt) || new Date().toISOString(),
          lastSaveMode: normalizeText(config.lastSaveMode) || "autosave",
        },
        {
          sourceWorkflow: config.sourceWorkflow,
          sourceCsrId: config.sourceCsrId,
          updatedAt: normalizeText(config.savedAt) || new Date().toISOString(),
          syncMode: config.syncMode,
        }
      );
      const replaceChanged =
        JSON.stringify(existingMembers || {}) !== JSON.stringify(sourceMembers || {}) ||
        JSON.stringify(existingAddedMembers) !== JSON.stringify(sourceAddedMembers) ||
        JSON.stringify(existingProfileOverrides || {}) !== JSON.stringify(sourceProfileOverrides || {}) ||
        JSON.stringify(existingDeletedKeys) !== JSON.stringify(sourceDeletedKeys);
      if (!replaceChanged) {
        return { record, changed: false };
      }
      return {
        record: {
          ...record,
          familyComposition: nextFamilyComposition,
        },
        changed: true,
      };
    }

    sourceMemberKeys.forEach((memberKey) => {
      const sourceEntry =
        sourceMembers[memberKey] && typeof sourceMembers[memberKey] === "object"
          ? sourceMembers[memberKey]
          : {};
      const existingEntry =
        nextMembers[memberKey] && typeof nextMembers[memberKey] === "object"
          ? nextMembers[memberKey]
          : {};
      const nextEntry = {
        ...existingEntry,
      };
      let entryChanged = false;

      CROSS_WORKFLOW_SHARED_FAMILY_COMPOSITION_FIELDS.forEach((fieldName) => {
        const sourceHasField = Object.prototype.hasOwnProperty.call(sourceEntry, fieldName);
        if (!sourceHasField) {
          return;
        }
        const sourceValue = normalizeSharedFamilyCompositionFieldValue(
          fieldName,
          sourceEntry[fieldName]
        );
        if (!sourceValue) {
          return;
        }
        const currentValue = normalizeSharedFamilyCompositionFieldValue(
          fieldName,
          existingEntry[fieldName]
        );
        if (config.onlyIfEmpty && currentValue) {
          return;
        }
        if (currentValue === sourceValue) {
          return;
        }
        nextEntry[fieldName] = sourceValue;
        entryChanged = true;
      });

      if (entryChanged) {
        nextMembers[memberKey] = nextEntry;
        changed = true;
      }
    });

    const existingDeletedKeys = Array.isArray(existingStore.deletedMemberKeys)
      ? existingStore.deletedMemberKeys.map((item) => normalizeText(item)).filter(Boolean)
      : [];
    const existingAddedMembers = Array.isArray(existingStore.addedMembers)
      ? cloneJsonValue(existingStore.addedMembers) || []
      : [];
    const existingProfileOverrides =
      existingStore.memberProfileOverrides && typeof existingStore.memberProfileOverrides === "object"
        ? cloneJsonValue(existingStore.memberProfileOverrides) || {}
        : {};
    const addedMembersChanged =
      JSON.stringify(existingAddedMembers) !== JSON.stringify(sourceAddedMembers);
    const profileOverridesChanged =
      JSON.stringify(existingProfileOverrides) !== JSON.stringify(sourceProfileOverrides);
    if (addedMembersChanged) {
      changed = true;
    }
    if (profileOverridesChanged) {
      changed = true;
    }
    if (!changed) {
      return { record, changed: false };
    }
    const savedAt = normalizeText(config.savedAt) || new Date().toISOString();
    const nextFamilyComposition = setFamilyCompositionSyncAuditMetadata(
      {
        ...existingStore,
        members: nextMembers,
        addedMembers: sourceAddedMembers,
        memberProfileOverrides: sourceProfileOverrides,
        deletedMemberKeys: existingDeletedKeys,
        savedAt,
        lastSaveMode: normalizeText(config.lastSaveMode) || "autosave",
      },
      {
        sourceWorkflow: config.sourceWorkflow,
        sourceCsrId: config.sourceCsrId,
        updatedAt: savedAt,
        syncMode: config.syncMode,
      }
    );
    const nextRecord = {
      ...record,
      familyComposition: nextFamilyComposition,
    };
    return { record: nextRecord, changed: true };
  }

  async function syncRecordToCounterpartWorkflow(sourceRecord, options) {
    const config = {
      syncBasicInfo: false,
      syncFamilyComposition: false,
      replaceFamilyCompositionState: false,
      sourceSavedAt: "",
      onlyIfEmpty: false,
      ...options,
    };
    if (!sourceRecord || !sourceRecord.csrId) {
      return false;
    }
    const sourceWorkflow = normalizeWorkflowType(sourceRecord.workflowType || activeWorkflowType);
    const cardData = sourceRecord.cardData && typeof sourceRecord.cardData === "object"
      ? sourceRecord.cardData
      : null;
    if (!cardData) {
      return false;
    }
    const counterpartWorkflow = getCounterpartWorkflowType(sourceWorkflow);
    const counterpartRecord = await getExistingCsrRecordForCardSafe(cardData, counterpartWorkflow);
    if (!counterpartRecord || !counterpartRecord.csrId) {
      return false;
    }

    let nextRecord = {
      ...counterpartRecord,
      workflowType: counterpartWorkflow,
    };
    let changed = false;
    const savedAt = normalizeText(config.sourceSavedAt) || new Date().toISOString();
    const sourceWorkflowType = normalizeWorkflowType(
      sourceRecord && sourceRecord.workflowType
    );
    const sourceCsrId = normalizeText(sourceRecord && sourceRecord.csrId);

    if (config.syncBasicInfo) {
      const basicInformation =
        sourceRecord.basicInformation && typeof sourceRecord.basicInformation === "object"
          ? sourceRecord.basicInformation
          : null;
      const sharedPayload = extractSharedBasicInfoPayload(
        basicInformation && basicInformation.editDetails
      );
      const basicResult = applySharedBasicInfoToRecord(nextRecord, sharedPayload, {
        onlyIfEmpty: !!config.onlyIfEmpty,
        savedAt,
        lastSaveMode: "autosave",
        sourceWorkflow: sourceWorkflowType,
        sourceCsrId,
        syncMode: "auto-sync",
      });
      nextRecord = basicResult.record;
      changed = changed || basicResult.changed;
    }

    if (config.syncFamilyComposition) {
      const familyResult = applySharedFamilyCompositionToRecord(
        nextRecord,
        sourceRecord.familyComposition,
        {
          onlyIfEmpty: !!config.onlyIfEmpty,
          replaceEntireState: !!config.replaceFamilyCompositionState,
          savedAt,
          lastSaveMode: "autosave",
          sourceWorkflow: sourceWorkflowType,
          sourceCsrId,
          syncMode: config.replaceFamilyCompositionState ? "reset-sync" : "auto-sync",
        }
      );
      nextRecord = familyResult.record;
      changed = changed || familyResult.changed;
    }

    if (!changed) {
      return false;
    }
    try {
      await persistCsrRecord(nextRecord);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function hydrateRecordFromCounterpartWorkflow(record) {
    if (!record || !record.csrId) {
      return record;
    }
    const targetRecord = buildRecordSyncSnapshot(record, {
      includeBasicInfo: true,
      includeFamilyComposition: true,
    });
    if (!targetRecord) {
      return record;
    }
    const counterpartWorkflow = getCounterpartWorkflowType(targetRecord.workflowType);
    const counterpartRecord = await getExistingCsrRecordForCardSafe(
      targetRecord.cardData,
      counterpartWorkflow
    );
    if (!counterpartRecord || !counterpartRecord.csrId) {
      return record;
    }
    const savedAt = new Date().toISOString();
    let nextRecord = {
      ...targetRecord,
      workflowType: normalizeWorkflowType(targetRecord.workflowType),
    };
    let changed = false;

    const counterpartBasicInformation =
      counterpartRecord.basicInformation && typeof counterpartRecord.basicInformation === "object"
        ? counterpartRecord.basicInformation
        : null;
    const sharedPayload = extractSharedBasicInfoPayload(
      counterpartBasicInformation && counterpartBasicInformation.editDetails
    );
    const basicResult = applySharedBasicInfoToRecord(nextRecord, sharedPayload, {
      onlyIfEmpty: false,
      savedAt,
      lastSaveMode: "autosave",
      sourceWorkflow: counterpartWorkflow,
      sourceCsrId: normalizeText(counterpartRecord && counterpartRecord.csrId),
      syncMode: "hydrate-sync",
    });
    nextRecord = basicResult.record;
    changed = changed || basicResult.changed;

    const familyResult = applySharedFamilyCompositionToRecord(
      nextRecord,
      counterpartRecord.familyComposition,
      {
        onlyIfEmpty: false,
        replaceEntireState:
          normalizeText(
            counterpartRecord &&
            counterpartRecord.familyComposition &&
            counterpartRecord.familyComposition.syncAudit &&
            counterpartRecord.familyComposition.syncAudit.lastSyncMode
          ) === "reset-sync",
        savedAt,
        lastSaveMode: "autosave",
        sourceWorkflow: counterpartWorkflow,
        sourceCsrId: normalizeText(counterpartRecord && counterpartRecord.csrId),
        syncMode: "hydrate-sync",
      }
    );
    nextRecord = familyResult.record;
    changed = changed || familyResult.changed;

    if (!changed) {
      return record;
    }
    try {
      await persistCsrRecord(nextRecord);
      return nextRecord;
    } catch (_) {
      return record;
    }
  }

  function findExistingCsrRecord(records, cardData) {
    const targetKey = buildHouseholdKey(cardData);
    if (!targetKey) {
      return null;
    }

    return (
      records.find((record) => {
        const recordCardData = record && record.cardData ? record.cardData : {};
        const recordKey = record && record.householdKey
          ? String(record.householdKey)
          : buildHouseholdKey(recordCardData);
        return recordKey === targetKey;
      }) || null
    );
  }

  function generateUniqueCsrId(existingIds) {
    const rangeSize = CSR_ID_MAX - CSR_ID_MIN + 1;
    const existingSet = new Set(existingIds.map((id) => String(id)));
    if (existingSet.size >= rangeSize) {
      throw new Error("No available 4-digit CSR IDs.");
    }

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const candidate = String(
        Math.floor(Math.random() * rangeSize) + CSR_ID_MIN
      );
      if (!existingSet.has(candidate)) {
        return candidate;
      }
    }

    for (let value = CSR_ID_MIN; value <= CSR_ID_MAX; value += 1) {
      const candidate = String(value);
      if (!existingSet.has(candidate)) {
        return candidate;
      }
    }

    throw new Error("No available 4-digit CSR IDs.");
  }

  function putCsrRecord(db, record) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CSR_STORE_NAME, "readwrite");
      const store = tx.objectStore(CSR_STORE_NAME);
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error("Failed to save CSR record."));
    });
  }

  async function getReservedCsrIdsForCreation(existingRecords) {
    const ids = new Set(
      (Array.isArray(existingRecords) ? existingRecords : [])
        .map((record) => String(record && record.csrId ? record.csrId : ""))
        .filter(Boolean)
    );
    try {
      const db = await openCsrDb();
      const allLocalRecords = await getAllCsrRecords(db);
      allLocalRecords.forEach((record) => {
        const id = String(record && record.csrId ? record.csrId : "");
        if (id) {
          ids.add(id);
        }
      });
    } catch (_) {
      // Ignore local ID cache read failures; caller still has scoped existing IDs.
    }
    return Array.from(ids);
  }

  async function createOrGetCsrRecord(cardData, workflowType) {
    const normalizedWorkflowType = normalizeWorkflowType(workflowType || activeWorkflowType);
    const municipality = normalizeText(cardData && cardData.municipality).toUpperCase();
    const existingRecords = await getPrimaryCsrRecordsForMunicipality(
      municipality,
      normalizedWorkflowType
    );
    const existingRecord = findExistingCsrRecord(existingRecords, cardData);

    if (existingRecord) {
      const mergedRecord = {
        ...existingRecord,
        workflowType: normalizedWorkflowType,
        householdKey: buildHouseholdKey(cardData),
        cardData: {
          ...(existingRecord.cardData || {}),
          name: cardData.name || "",
          hhid: cardData.hhid || "",
          municipality: cardData.municipality || "",
          barangay: cardData.barangay || "",
        },
        lastOpenedAt: new Date().toISOString(),
      };
      return { record: mergedRecord, isNew: false };
    }

    const existingIds = await getReservedCsrIdsForCreation(existingRecords);
    const csrId = generateUniqueCsrId(existingIds);
    const record = {
      csrId,
      createdAt: new Date().toISOString(),
      activeStep: 1,
      workflowType: normalizedWorkflowType,
      completion: {
        status: "in_progress",
        completedAt: "",
        lastExportedAt: "",
        lastExportedFileName: "",
        exportCount: 0,
      },
      householdKey: buildHouseholdKey(cardData),
      cardData: {
        name: cardData.name || "",
        hhid: cardData.hhid || "",
        municipality: municipality,
        barangay: cardData.barangay || "",
      },
    };
    await saveCsrRecordToPrimaryStorage(record);
    return { record: record, isNew: true };
  }

  async function getExistingCsrRecordForCard(cardData, workflowType) {
    const normalizedWorkflowType = normalizeWorkflowType(workflowType || activeWorkflowType);
    const municipality = normalizeText(cardData && cardData.municipality).toUpperCase();
    if (!municipality) {
      return null;
    }
    const existingRecords = await getPrimaryCsrRecordsForMunicipality(
      municipality,
      normalizedWorkflowType
    );
    return findExistingCsrRecord(existingRecords, cardData);
  }

  async function getExistingCsrRecordForCardSafe(cardData, workflowType) {
    try {
      return await getExistingCsrRecordForCard(cardData, workflowType);
    } catch (_) {
      return null;
    }
  }

  function getCsrCompletionState(record) {
    const completion =
      record && record.completion && typeof record.completion === "object"
        ? record.completion
        : null;
    const status = normalizeText(completion && completion.status).toLowerCase();
    return {
      isCompleted: status === "completed",
      status: status || "in_progress",
      completedAt: normalizeText(completion && completion.completedAt),
      lastExportedAt: normalizeText(completion && completion.lastExportedAt),
      lastExportedFileName: normalizeText(completion && completion.lastExportedFileName),
      exportCount: Number.isFinite(Number(completion && completion.exportCount))
        ? Number(completion && completion.exportCount)
        : 0,
    };
  }

  function formatCompletionDateLabel(isoValue) {
    const raw = normalizeText(isoValue);
    if (!raw) {
      return "";
    }
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }
    try {
      return parsed.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return "";
    }
  }

  async function markCurrentCsrRecordAsCompleted(exportFileName) {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }
    const now = new Date().toISOString();
    const completionState = getCsrCompletionState(currentCsrRecord);
    const nextExportCount = (completionState.exportCount || 0) + 1;
    currentCsrRecord.completion = {
      status: "completed",
      completedAt: completionState.completedAt || now,
      lastExportedAt: now,
      lastExportedFileName: normalizeText(exportFileName),
      exportCount: nextExportCount,
    };
    try {
      await persistCsrRecord(currentCsrRecord);
    } catch (_) {
      // Ignore completion metadata save failures; export already succeeded.
    }
  }

  async function persistCsrRecord(record) {
    if (!record || !record.csrId) {
      return;
    }
    record.workflowType = normalizeWorkflowType(record.workflowType || activeWorkflowType);
    const saved = await saveCsrRecordToPrimaryStorage(record);
    if (!saved) {
      throw new Error("Failed to save CSR record to primary storage.");
    }
  }

})();
