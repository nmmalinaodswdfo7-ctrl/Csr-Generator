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
  const CSR_TEMPLATE_PAYLOAD_KEY = "csr_template_payload_v1";
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
  const SOURCE_OF_INFO_FIELD_ID = "edit-source-of-info";
  const SOURCE_OF_INFO_DATALIST_ID = "source-of-info-datalist";
  const PREV_WELLBEING_FIELD_ID = "edit-prev-wellbeing";
  const PREV_WELLBEING_DATALIST_ID = "prev-wellbeing-datalist";
  const BASIC_INFO_AUTOSAVE_DELAY_MS = 700;
  const FAMILY_COMPOSITION_AUTOSAVE_DELAY_MS = 700;
  const CASE_DEVELOPMENT_AUTOSAVE_DELAY_MS = 700;
  const INTERVENTIONS_PROVIDED_AUTOSAVE_DELAY_MS = 700;
  const INTERVENTIONS_PROVIDED_DRAFT_AUTOSAVE_DELAY_MS = 700;
  const HOUSEHOLD_INTERVENTION_PLAN_AUTOSAVE_DELAY_MS = 700;
  const HOUSEHOLD_INTERVENTION_PLAN_DRAFT_AUTOSAVE_DELAY_MS = 700;
  const RECOMMENDATION_AUTOSAVE_DELAY_MS = 700;
  const RECOMMENDATION_DEFAULT_NAMES = Object.freeze({
    reviewedBy: "MIGUELIZA V. FELIAS, RSW",
    notedBy: "LUZ C. FEGARIDO, RSW",
    approvedBy: "JIAH L. SAYSON",
    mswdOfficer: "ESTRELLA S. MALNEGRO, RSW",
  });
  const BASIC_INFO_OPTIONAL_FIELD_IDS = new Set([
    "edit-contact-info",
    "edit-national-id",
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
  let hasPendingMunicipalityUpdate = false;
  let currentCsrRecord = null;
  let activeCsrStep = 1;
  let basicInfoPrefillRequestSeq = 0;
  let basicInfoAutoSaveTimer = null;
  let familyCompositionAutoSaveTimer = null;
  let caseDevelopmentAutoSaveTimer = null;
  let interventionsProvidedAutoSaveTimer = null;
  let interventionsProvidedDraftAutoSaveTimer = null;
  let householdInterventionPlanAutoSaveTimer = null;
  let householdInterventionPlanDraftAutoSaveTimer = null;
  let recommendationAutoSaveTimer = null;
  let recommendationPdfExportInProgress = false;
  let exportInvalidSteps = new Set();
  let exportValidationArmed = false;
  let recommendationPreparedByFetchPromise = null;
  let caseDevelopmentApplyingEditorValue = false;
  let caseDevelopmentSummernoteReady = false;
  let loginInProgress = false;
  let csrOpenConfirmShownKeys = new Set();
  let pendingCsrDeepLink = null;
  let educationalAttainmentSyncInProgress = false;

  const idInput = document.getElementById("user-id");
  const municipalitySelect = document.getElementById("municipality");
  const loginIdField = document.getElementById("login-id-field");
  const loginMunicipalityField = document.getElementById("login-municipality-field");
  const loginButton = document.getElementById("search-id");
  const loginButtonLabel = loginButton
    ? loginButton.querySelector("span")
    : null;
  const restoreSessionButton = document.getElementById("restore-session");
  const loginSection = document.getElementById("login-section");
  const dataTableHeader = document.getElementById("data-table-header");
  const returnToSelectionButton = document.getElementById("return-to-csr-selection");
  const dataTableCard = document.getElementById("data-table-card");
  const dataSearchInput = document.getElementById("data-search-input");
  const barangayFilter = document.getElementById("barangay-filter");
  const statusFilter = document.getElementById("status-filter");
  const updateDataButton = document.getElementById("update-data-btn");
  const dataLoader = document.getElementById("data-loader");
  const householdGrid = document.getElementById("household-grid");
  const csrStepper = document.getElementById("csr-stepper");
  const stepTriggers = Array.from(document.querySelectorAll("[data-step-trigger]"));
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
  const recommendationPreviewOpenBrowserButton = document.getElementById(
    "recommendation-preview-open-browser-btn"
  );
  const recommendationPreviewPrintButton = document.getElementById("recommendation-preview-print-btn");
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
  const familyCompositionRestoreButton = document.getElementById("family-composition-restore-btn");
  const familyCompositionResetButton = document.getElementById("family-composition-reset-btn");
  const basicInfoRestoreButton = document.getElementById("basic-info-restore-btn");
  const familyCompositionRestoreModal = document.getElementById("family-composition-restore-modal");
  const familyCompositionRestoreList = document.getElementById("family-composition-restore-list");
  const familyCompositionRestoreCloseButton = document.getElementById("family-composition-restore-close-btn");
  const familyCompositionRestoreCancelButton = document.getElementById("family-composition-restore-cancel-btn");
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
  let householdInterventionPlanEditingIndex = null;

  initSummernoteIfPresent();

  if (!idInput || !municipalitySelect || !loginButton) {
    return;
  }

  pendingCsrDeepLink = parseCsrDeepLinkFromUrl();
  initializeSessionState();
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
  if (interventionsProvidedBackButton) {
    interventionsProvidedBackButton.addEventListener("click", handleInterventionsProvidedBackClick);
  }
  if (householdInterventionPlanBackButton) {
    householdInterventionPlanBackButton.addEventListener("click", handleHouseholdInterventionPlanBackClick);
  }
  if (recommendationBackButton) {
    recommendationBackButton.addEventListener("click", handleRecommendationBackClick);
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
  if (recommendationPreviewPrintButton) {
    recommendationPreviewPrintButton.addEventListener("click", printRecommendationPreviewIframe);
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
  document.addEventListener("keydown", (event) => {
    if (!event) {
      return;
    }

    const recommendationPreviewOpen =
      recommendationPreviewModal &&
      !recommendationPreviewModal.classList.contains("hidden");
    const interventionsModalOpen =
      interventionsProvidedModal &&
      !interventionsProvidedModal.classList.contains("hidden");
    const householdPlanModalOpen =
      householdInterventionPlanModal &&
      !householdInterventionPlanModal.classList.contains("hidden");
    const isPrintShortcut =
      (event.ctrlKey || event.metaKey) &&
      String(event.key || "").toLowerCase() === "p";

    if (isPrintShortcut && recommendationPreviewOpen) {
      event.preventDefault();
      printRecommendationPreviewIframe();
      return;
    }

    if (event.key === "Escape") {
      if (recommendationPreviewOpen) {
        event.preventDefault();
        closeRecommendationPreviewModal();
        return;
      }
      if (interventionsModalOpen) {
        event.preventDefault();
        closeInterventionsProvidedModal();
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
      if (householdPlanModalOpen) {
        event.preventDefault();
        void handleHouseholdInterventionPlanModalSaveClick();
      }
    }
  });
  if (familyCompositionRestoreButton) {
    familyCompositionRestoreButton.addEventListener("click", openFamilyCompositionRestoreModal);
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
  bindStepperEvents();
  bindBasicInfoEditValidationListeners();
  bindBasicInfoFieldConstraints();
  bindBasicInfoAutoSaveListeners();
  bindEducationalAttainmentLiveSync();
  bindFamilyCompositionEvents();
  bindInterventionsProvidedEvents();
  bindHouseholdInterventionPlanEvents();
  bindRecommendationEvents();
  bindPageLifecycleAutoSaveFlush();

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
      try {
        // Prefer upstream on login so newly downloaded municipality JSON is fresh.
        municipalityData = await fetchSheetData(userMunicipality, true);
      } catch (_) {
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
        showDatasetOfflinePopup({
          title: "Municipality Dataset Unavailable",
          message:
            "Municipality source returned empty data. Contact the developer to check your municipality dataset.",
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
      const proxyData =
        Array.isArray(proxyPayload) ||
        (proxyPayload && Array.isArray(proxyPayload.data))
          ? Array.isArray(proxyPayload)
            ? proxyPayload
            : proxyPayload.data
          : proxyPayload && proxyPayload.ok && Array.isArray(proxyPayload.data)
          ? proxyPayload.data
          : null;
      if (!proxyData) {
        throw buildMunicipalityDatasetFetchError(
          sheetName,
          `Invalid response for sheet ${sheetName}`
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

  async function ensureMunicipalityDbFile(municipality) {
    if (!isHttpContext()) {
      return false;
    }

    const safeMunicipality = normalizeText(municipality).toUpperCase();
    if (!safeMunicipality) {
      return false;
    }

    try {
      const response = await fetch("/api/csr/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ municipality: safeMunicipality }),
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
        return false;
      }
      const payload = await response.json();
      return !!(payload && payload.ok);
    } catch (_) {
      return false;
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

  function hideLoginSection() {
    if (!loginSection) {
      return;
    }

    loginSection.classList.add("hidden");
  }

  async function showPostLoginUI() {
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
            Create CSR
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
    hideCsrWorkspace();
    if (loginSection) {
      loginSection.classList.remove("hidden");
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
    hideCsrWorkspace();
    if (loginSection) {
      loginSection.classList.remove("hidden");
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
      const hasWriteAccess = isHttpContext()
        ? true
        : await ensureDownloadsDirectoryWriteAccess(true);
      if (!hasWriteAccess) {
        showToast(
          "Folder access not granted. Please allow read/write access to your downloads folder."
        );
        return;
      }

      const latestRows =
        pendingMunicipalityRows ||
        (await fetchSheetData(activeMunicipalityForCards, true));

      const savedToMunicipalityFile = await silentlySaveMunicipalityJson(
        activeMunicipalityForCards,
        latestRows
      );
      if (!savedToMunicipalityFile) {
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
      if (orphanCleanupPending) {
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
    if (isHttpContext()) {
      return saveSheetJsonViaServer(sheetName, rows);
    }

    const fileName = `${toSheetJsonBaseName(sheetName)}.json`;
    const json = JSON.stringify(rows, null, 2);

    const initialHandleReady = await ensureDownloadsDirectoryWriteAccess(false);
    if (!initialHandleReady) {
      return false;
    }

    try {
      return await writeMunicipalityJsonToHandle(downloadsDirectoryHandle, fileName, json);
    } catch (error) {
      if (!isRecoverableWriteError(error)) {
        return false;
      }

      // Stored handle may be stale or permission may have changed.
      // Do not invoke picker here because user activation may no longer be available.
      downloadsDirectoryHandle = null;
      const recoveredHandleReady = await ensureDownloadsDirectoryWriteAccess(false);
      if (!recoveredHandleReady) {
        return false;
      }

      try {
        return await writeMunicipalityJsonToHandle(
          downloadsDirectoryHandle,
          fileName,
          json
        );
      } catch (_) {
        return false;
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

  function confirmUserAction(message) {
    if (!isElectronRuntime()) {
      return Promise.resolve(window.confirm(message));
    }

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
      !window.jQuery.fn.summernote ||
      !document.getElementById("summernote")
    ) {
      return;
    }

    window.jQuery("#summernote").summernote({
      placeholder: "Provide a detailed narrative of the Case Development.",
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
          scheduleCaseDevelopmentAutoSave();
          refreshExportValidationGlow();
        },
        onBlur: () => {
          const normalizedOnBlur = getCaseDevelopmentEditorHtml();
          setCaseDevelopmentEditorHtml(normalizedOnBlur);
          setCaseDevelopmentFieldError(!normalizeText(getCaseDevelopmentEditorHtml()));
          flushCaseDevelopmentAutoSave(true);
          refreshExportValidationGlow();
        },
      },
    });
  }

  function bindStepperEvents() {
    stepTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const step = Number(trigger.dataset.stepTrigger);
        if (!Number.isInteger(step) || step < 1 || step > CSR_STEP_COUNT) {
          return;
        }
        setActiveCsrStep(step);
      });
    });
  }

  async function handleHouseholdGridClick(event) {
    const button = event.target.closest(".create-csr-btn");
    if (!button) {
      return;
    }

    button.disabled = true;
    try {
      const cardData = {
        name: normalizeText(button.getAttribute("data-name")),
        hhid: normalizeText(button.getAttribute("data-hhid")),
        municipality: normalizeText(button.getAttribute("data-municipality")),
        barangay: normalizeText(button.getAttribute("data-barangay")),
      };
      const existingRecord = await getExistingCsrRecordForCardSafe(cardData);
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
                ? `Completed CSR already exists (completed on ${completedOnLabel}). Opening existing record.`
                : "Completed CSR already exists. Opening existing record.",
              "pending",
              6000
            );
          }
          csrOpenConfirmShownKeys.add(promptKey);
        }
      }
      const result = await createOrGetCsrRecord(cardData);
      let recordToOpen = result.record;
      if (!result.isNew && result.record && result.record.csrId) {
        try {
          const refreshedRecord = await getCsrRecordById(
            result.record.csrId,
            normalizeText(cardData && cardData.municipality).toUpperCase()
          );
          if (refreshedRecord) {
            recordToOpen = refreshedRecord;
          }
        } catch (_) {
          // Keep original open flow if refresh-by-id fails.
        }
      }
      currentCsrRecord = recordToOpen;
      applySavedBasicInfoEditDetails();
      applySavedCaseDevelopmentDetails();
      applySavedInterventionsProvidedDetails();
      applySavedHouseholdInterventionPlanDetails();
      applySavedRecommendationDetails();
      showCsrWorkspace();
      setActiveCsrStep(1);
      void populateBasicInfoFromSelectedCard(
        recordToOpen && recordToOpen.cardData,
        recordToOpen && recordToOpen.csrId
      );
      void populateFamilyCompositionFromSelectedCard(
        recordToOpen && recordToOpen.cardData
      );
      setCsrViewState({
        mode: "workspace",
        csrId: String(recordToOpen.csrId || ""),
        activeStep: 1,
      });
      showToast(
        result.isNew
          ? `CSR ${recordToOpen.csrId} created.`
          : `CSR ${recordToOpen.csrId} opened.`,
        "success",
        3000
      );
    } catch (error) {
      console.error("Create CSR failed:", error);
      showToast("Unable to create CSR. Please try again.");
    } finally {
      button.disabled = false;
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
    flushCaseDevelopmentAutoSave(true);
    flushInterventionsProvidedDraftAutoSave(true);
    flushInterventionsProvidedAutoSave(true);
    flushHouseholdInterventionPlanDraftAutoSave(true);
    flushHouseholdInterventionPlanAutoSave(true);
    flushRecommendationAutoSave(true);
    closeFamilyCompositionRestoreModal();
    closeInterventionsProvidedModal();
    closeHouseholdInterventionPlanModal();
    renderInterventionsProvidedRows([]);
    renderHouseholdInterventionPlanRows([]);
    latestFamilyCompositionRows = [];
    setFamilyCompositionSaveStatus("", "neutral");
    setCaseDevelopmentSaveStatus("", "neutral");
    setInterventionsProvidedSaveStatus("", "neutral");
    setHouseholdInterventionPlanSaveStatus("", "neutral");
    setRecommendationSaveStatus("", "neutral");
    clearModalFieldError(recommendationTextField);
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
    const previousStep = activeCsrStep;
    if (previousStep === 1 && step !== 1) {
      flushBasicInfoAutoSave();
    }
    if (previousStep === 2 && step !== 2) {
      flushFamilyCompositionAutoSave();
    }
    if (previousStep === 3 && step !== 3) {
      flushCaseDevelopmentAutoSave(true);
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
    activeCsrStep = step;

    stepSections.forEach((section) => {
      const sectionStep = Number(section.dataset.stepSection);
      section.classList.toggle("hidden", sectionStep !== step);
    });

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
        activeStep: step,
      });
      if (step === 2) {
        void populateFamilyCompositionFromSelectedCard(currentCsrRecord.cardData);
      }
      if (step === 3 && previousStep !== 3) {
        applySavedCaseDevelopmentDetails();
      }
      if (step === 6) {
        applySavedRecommendationDetails();
      }
    }
  }

  function setExportInvalidSteps(stepNumbers) {
    exportInvalidSteps = new Set(
      (Array.isArray(stepNumbers) ? stepNumbers : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= CSR_STEP_COUNT)
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

  function collectStepperExportValidation(options) {
    const config = {
      markFields: false,
      ...options,
    };
    const invalidSteps = [];
    const messages = [];

    const basicFields = getBasicInfoRequiredFields();
    let stepOneInvalid = false;
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
        stepOneInvalid = true;
      }
    });
    const yearsInProgram = getFieldValue("edit-years-program");
    const yearsField = document.getElementById("edit-years-program");
    if (!/^\d{1,2}$/.test(yearsInProgram || "")) {
      stepOneInvalid = true;
      if (config.markFields) {
        setBasicInfoFieldError(yearsField);
      }
    } else if (config.markFields) {
      clearBasicInfoFieldError(yearsField);
    }
    const contactInfoField = document.getElementById("edit-contact-info");
    const contactInfoInvalid = isContactInfoValueInvalid(
      contactInfoField ? contactInfoField.value : ""
    );
    if (contactInfoInvalid) {
      stepOneInvalid = true;
      if (config.markFields) {
        setBasicInfoFieldError(contactInfoField);
      }
    } else if (config.markFields) {
      clearBasicInfoFieldError(contactInfoField);
    }
    const nationalIdField = document.getElementById("edit-national-id");
    const nationalIdInvalid = isNationalIdValueInvalid(
      nationalIdField ? nationalIdField.value : ""
    );
    if (nationalIdInvalid) {
      stepOneInvalid = true;
      if (config.markFields) {
        setBasicInfoFieldError(nationalIdField);
      }
    } else if (config.markFields) {
      clearBasicInfoFieldError(nationalIdField);
    }
    if (stepOneInvalid) {
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
      messages.push("Case Development is required.");
    }

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
    getBasicInfoRequiredFields().forEach((field) => {
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
    getBasicInfoRequiredFields().forEach((field) => {
      const eventName = field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventName, scheduleBasicInfoAutoSave);
      if (eventName !== "change") {
        field.addEventListener("change", scheduleBasicInfoAutoSave);
      }
    });
  }

  function bindFamilyCompositionEvents() {
    if (!familyCompositionList) {
      return;
    }
    familyCompositionList.addEventListener("click", handleFamilyCompositionListClick);
    familyCompositionList.addEventListener("input", handleFamilyCompositionInputChange);
    familyCompositionList.addEventListener("change", handleFamilyCompositionInputChange);
    if (familyCompositionRestoreList) {
      familyCompositionRestoreList.addEventListener("click", handleFamilyCompositionRestoreListClick);
    }
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
    }
    if (interventionsProvidedDateField) {
      interventionsProvidedDateField.value = normalizeText(safeValues.dateCompleted);
    }
    if (interventionsProvidedPartiesField) {
      interventionsProvidedPartiesField.value = normalizeText(safeValues.involvedParties);
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
              <textarea data-ip-index="${index}" data-ip-field="intervention" rows="3" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">${intervention}</textarea>
            </td>
            <td class="px-6 py-4 align-top">
              <input data-ip-index="${index}" data-ip-field="dateCompleted" type="text" value="${dateCompleted}" class="w-full h-10 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
            </td>
            <td class="px-6 py-4 align-top">
              <input data-ip-index="${index}" data-ip-field="involvedParties" type="text" value="${involvedParties}" class="w-full h-10 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
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
    }
    if (householdInterventionPlanActivitiesField) {
      householdInterventionPlanActivitiesField.value = normalizeText(safeValues.activities);
    }
    if (householdInterventionPlanResponsibleField) {
      householdInterventionPlanResponsibleField.value = normalizeText(safeValues.responsible);
    }
    if (householdInterventionPlanTimelineField) {
      householdInterventionPlanTimelineField.value = normalizeText(safeValues.timeline);
    }
    if (householdInterventionPlanOutcomeField) {
      householdInterventionPlanOutcomeField.value = normalizeText(safeValues.outcome);
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
              <textarea data-hip-index="${index}" data-hip-field="objectives" rows="3" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">${objectives}</textarea>
            </td>
            <td class="px-6 py-4 align-top">
              <textarea data-hip-index="${index}" data-hip-field="activities" rows="3" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">${activities}</textarea>
            </td>
            <td class="px-6 py-4 align-top">
              <textarea data-hip-index="${index}" data-hip-field="responsible" rows="2" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">${responsible}</textarea>
            </td>
            <td class="px-6 py-4 align-top">
              <input data-hip-index="${index}" data-hip-field="timeline" type="text" value="${timeline}" class="w-full h-10 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
            </td>
            <td class="px-6 py-4 align-top">
              <textarea data-hip-index="${index}" data-hip-field="outcome" rows="3" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">${outcome}</textarea>
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

  function applyRecommendationStaticPrefill() {
    if (recommendationDateField && !normalizeText(recommendationDateField.value)) {
      recommendationDateField.value = getPhilippinesTodayIsoDate();
    }
    if (
      recommendationHhGranteeField &&
      !normalizeText(recommendationHhGranteeField.value) &&
      currentCsrRecord &&
      currentCsrRecord.cardData
    ) {
      recommendationHhGranteeField.value = normalizeText(currentCsrRecord.cardData.name);
    }
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
      hhGrantee: normalizeText(recommendationHhGranteeField && recommendationHhGranteeField.value),
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
      recommendationHhGranteeField.value = normalizeText(safe.hhGrantee);
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

  async function persistRecommendationDetails(options) {
    const config = {
      isAutoSave: false,
      showToastOnError: true,
      ...options,
    };
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return false;
    }
    const details = collectRecommendationDetails();
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
    await persistRecommendationDetails({
      isAutoSave: false,
      showToastOnError: false,
    });
    refreshExportValidationGlow();
    showToast("Default name saved.", "success", 2200);
  }

  function handleRecommendationBackClick() {
    flushRecommendationAutoSave(true);
    setActiveCsrStep(5);
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
      flushCaseDevelopmentAutoSave(true);
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
          `${normalizeText(exportResult && exportResult.fileName) || fileName} saved to Desktop\\CSR.`,
          "success",
          3200
        );
        exportSucceeded = true;
      } catch (error) {
        const details = normalizeText(error && error.message);
        showToast(
          details || "Unable to save PDF to Desktop\\CSR.",
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

  function queueSafeRedirectToDataTableAfterExport() {
    const workspaceVisibleNow =
      !!csrStepper && !csrStepper.classList.contains("hidden");
    if (!workspaceVisibleNow || !currentCsrRecord || !currentCsrRecord.csrId) {
      return;
    }

    window.setTimeout(() => {
      const workspaceStillVisible =
        !!csrStepper && !csrStepper.classList.contains("hidden");
      if (!workspaceStillVisible || recommendationPdfExportInProgress) {
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

  async function openCsrTemplateWithCurrentData() {
    try {
      const wrotePayload = await writeCsrTemplatePayloadSnapshot();
      if (!wrotePayload) {
        return false;
      }
      if (openCsrTemplateInModalPreview()) {
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

  function openCsrTemplateInModalPreview() {
    if (!recommendationPreviewModal || !recommendationPreviewIframe) {
      return false;
    }
    recommendationPreviewModal.classList.remove("hidden");
    recommendationPreviewModal.classList.add("flex");
    recommendationPreviewIframe.setAttribute(
      "src",
      `csr-template.html?embedded=1&printMode=1&t=${Date.now()}`
    );
    return true;
  }

  function closeRecommendationPreviewModal() {
    if (!recommendationPreviewModal) {
      return;
    }
    recommendationPreviewModal.classList.add("hidden");
    recommendationPreviewModal.classList.remove("flex");
  }

  async function printRecommendationPreviewIframe() {
    if (!recommendationPreviewIframe || !recommendationPreviewIframe.contentWindow) {
      showToast("Preview is not ready for printing.", "error", 2400);
      return;
    }
    const previewWindow = recommendationPreviewIframe.contentWindow;
    const start = Date.now();
    while (!previewWindow.__CSR_EXPORT_READY__ && Date.now() - start < 5000) {
      await wait(120);
    }
    if (!previewWindow.__CSR_EXPORT_READY__) {
      showToast("Preview is still rendering. Please try again in a moment.", "pending", 2600);
      return;
    }
    try {
      previewWindow.focus();
      previewWindow.print();
    } catch (_) {
      showToast("Unable to print preview content.", "error", 2600);
    }
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

  function scheduleRecommendationAutoSave() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
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

  function flushRecommendationAutoSave(forcePersist) {
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

  function flushAllAutoSaveQueues() {
    flushBasicInfoAutoSave();
    flushFamilyCompositionAutoSave();
    flushCaseDevelopmentAutoSave(true);
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
          normalizeText(basicEdited.sourceOfInfo),
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

  function collectBasicInfoForTemplate() {
    return {
      granteeName: normalizeText(basicGranteeNameInput && basicGranteeNameInput.value),
      householdId: normalizeText(basicHhIdInput && basicHhIdInput.value),
      hhSet: normalizeText(basicHhSetInput && basicHhSetInput.value),
      sex: normalizeText(basicSexInput && basicSexInput.value),
      birthday: normalizeText(basicBirthdayInput && basicBirthdayInput.value),
      age: normalizeText(basicAgeInput && basicAgeInput.value),
      civilStatus: normalizeText(basicCivilStatusInput && basicCivilStatusInput.value),
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

    const rows = sourceRows
      .slice()
      .sort((a, b) => parseAgeForSort(b && b.AGE) - parseAgeForSort(a && a.AGE));
    const membersStore = getFamilyCompositionMembersStore();
    const deletedKeys = getFamilyCompositionDeletedKeysStore();

    return rows
      .filter((row) => !deletedKeys.has(getFamilyCompositionMemberKey(row)))
      .map((row) => {
        const memberKey = getFamilyCompositionMemberKey(row);
        return {
          name: normalizeText(row && (row.NAMES || row.NAME)),
          sex: normalizeText(row && row.SEX),
          age: normalizeText(row && row.AGE),
          civilStatus: normalizeText(row && row.CIVIL_STATUS),
          relationship: normalizeText(row && row.RELATION_TO_HH_HEAD),
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
    const confirmed = await confirmUserAction(
      "Delete this member from the Family Composition view? You can restore later."
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
    scheduleFamilyCompositionAutoSave();
    refreshExportValidationGlow();
  }

  function scheduleFamilyCompositionAutoSave() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
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
    if (familyCompositionAutoSaveTimer) {
      window.clearTimeout(familyCompositionAutoSaveTimer);
      familyCompositionAutoSaveTimer = null;
      void persistFamilyCompositionEdits({ isAutoSave: true });
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
      container
        .querySelectorAll("script,style,iframe,object,embed,svg,math,meta,link")
        .forEach((node) => node.remove());

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
        const html = String(node.innerHTML || "")
          .replace(/&nbsp;/gi, " ")
          .replace(/\u00A0/g, " ")
          .replace(/\s+/g, "")
          .toLowerCase();
        return !html || html === "<br>" || html === "<br/>";
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

      // Enforce consistent typography by removing inline font overrides
      // that can survive paste/clear-format operations.
      Array.from(container.querySelectorAll("font")).forEach((fontNode) => {
        const fragment = document.createDocumentFragment();
        while (fontNode.firstChild) {
          fragment.appendChild(fontNode.firstChild);
        }
        fontNode.replaceWith(fragment);
      });
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
        const html = String(el.innerHTML || "")
          .replace(/&nbsp;/gi, " ")
          .replace(/\u00A0/g, " ")
          .replace(/\u200B/g, "")
          .replace(/\s+/g, "")
          .toLowerCase();
        return !html || html === "<br>" || html === "<br/>";
      };

      while (container.firstChild && isEmptyNode(container.firstChild)) {
        container.removeChild(container.firstChild);
      }
      while (container.lastChild && isEmptyNode(container.lastChild)) {
        container.removeChild(container.lastChild);
      }

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

  function getBasicInfoRequiredFields() {
    return Array.from(document.querySelectorAll("[data-basic-edit-required='1']"));
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
    syncInputDatalistVisibility(sourceOfInfoField, SOURCE_OF_INFO_DATALIST_ID);

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

  function collectBasicInfoEditDetails() {
    const contactInfoRaw = getFieldValue("edit-contact-info");
    const nationalIdRaw = getFieldValue("edit-national-id");
    return {
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
      prevWellBeingLevel: getFieldValue("edit-prev-wellbeing"),
    };
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

  function applySavedBasicInfoEditDetails() {
    resetBasicInfoEditDetailsForm();

    if (!currentCsrRecord || !currentCsrRecord.basicInformation) {
      return;
    }
    const editDetails = currentCsrRecord.basicInformation.editDetails;
    if (!editDetails || typeof editDetails !== "object") {
      return;
    }

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
    setFieldValue("basic-client-status-on-exit", editDetails.clientStatusOnExit);
    setFieldValue("edit-prev-wellbeing", editDetails.prevWellBeingLevel);

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
    setBasicInfoSaveStatus("", "neutral");
  }

  function restoreBasicInfoEditDefaultsFromPrefilled(prefilled) {
    const religionFieldBeforeReset = document.getElementById("edit-religion");
    const placeOfBirthBeforeReset = getFieldValue("edit-place-of-birth");
    const sourceOfInfoBeforeReset = getFieldValue("edit-source-of-info");
    const religionBeforeReset = normalizeText(
      religionFieldBeforeReset ? religionFieldBeforeReset.value : ""
    );

    resetBasicInfoEditDetailsForm();

    setEducationalAttainmentFieldValue(prefilled && prefilled.educationalAttainment, false);

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
      normalizeText(prefilled && prefilled.yearOfRegistration).replace(/\D/g, "").slice(0, 4)
    );
    setFieldValue(
      "edit-years-program",
      normalizeText(prefilled && prefilled.yearsInProgram).replace(/\D/g, "").slice(0, 2)
    );
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
    setFieldValue("edit-prev-wellbeing", normalizeText(prefilled && prefilled.prevWellBeingLevel));
    setFieldValue("edit-national-id", formatNationalId(normalizeText(prefilled && prefilled.nationalId)));
  }

  async function handleBasicInfoRestoreClick() {
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      showToast("No active CSR selected.");
      return;
    }

    const prefilled =
      currentCsrRecord &&
      currentCsrRecord.basicInformation &&
      currentCsrRecord.basicInformation.prefilled &&
      typeof currentCsrRecord.basicInformation.prefilled === "object"
        ? currentCsrRecord.basicInformation.prefilled
        : null;

    if (!prefilled || !hasCachedBasicInfoPrefilled(prefilled)) {
      showToast("No prefilled Basic Information values found.");
      return;
    }

    const confirmed = await confirmUserAction(
      "Are you sure you want to restore the default values of current grantee?"
    );
    if (!confirmed) {
      return;
    }

    if (basicInfoAutoSaveTimer) {
      window.clearTimeout(basicInfoAutoSaveTimer);
      basicInfoAutoSaveTimer = null;
    }

    restoreBasicInfoEditDefaultsFromPrefilled(prefilled);
    refreshExportValidationGlow();
    const saved = await persistBasicInfoEditDetails({ isAutoSave: false, showToastOnError: true });
    if (saved) {
      showToast("Basic Information restored to prefilled defaults.", "success", 2800);
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
    }

    setBasicInfoPrefillLoading(true);
    const municipality = normalizeText(cardData && cardData.municipality).toUpperCase();
    const hhid = normalizeText(cardData && cardData.hhid);
    const name = normalizeText(cardData && cardData.name).toUpperCase();
    if (!municipality || (!hhid && !name)) {
      if (isActiveCsrPrefillRequest(targetCsrId, requestSeq)) {
        fillBasicInfoLeftFields(null);
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
        currentCsrRecord.basicInformation = {
          ...(currentCsrRecord.basicInformation || {}),
          prefilled: {
            name: normalizeText(granteeRow && (granteeRow.NAME || granteeRow.NAMES)),
            hhid: normalizeText(granteeRow && granteeRow.HH_ID),
            hhSet: normalizeText(granteeRow && granteeRow.HH_SET),
            sex: normalizeText(granteeRow && granteeRow.SEX),
            birthday: normalizeText(granteeRow && granteeRow.BIRTHDAY),
            age: normalizeText(granteeRow && granteeRow.AGE),
            civilStatus: normalizeText(granteeRow && granteeRow.CIVIL_STATUS),
            ipAffiliation: normalizeText(granteeRow && granteeRow.IP_AFFILIATION) || "NONE",
            contactInfo: normalizeText(granteeRow && granteeRow["CONTACT NUMBER"]),
            nationalId: normalizeText(granteeRow && granteeRow.PCN),
            presentAddress: normalizeText(granteeRow && granteeRow.PRESENT_ADDRESS),
            religion: normalizeText(granteeRow && granteeRow.RELIGION),
            yearOfRegistration: normalizeText(granteeRow && granteeRow["YEAR OF REGISTRATION"]),
            yearsInProgram: normalizeText(granteeRow && granteeRow.YEARS_IN_PROGRAM),
            educationalAttainment: normalizeText(granteeRow && granteeRow.GRADE_LEVEL),
            clientStatusOnExit: normalizeText(granteeRow && granteeRow.CLIENT_STATUS),
            prevWellBeingLevel: buildPrevWellBeingLabel(
              granteeRow && granteeRow.LOWB,
              granteeRow && granteeRow["SWDI SCORE"]
            ),
          },
        };
        await persistCsrRecord(currentCsrRecord);
      }
    } catch (_) {
      if (isActiveCsrPrefillRequest(targetCsrId, requestSeq) && !hasCachedPrefilled) {
        fillBasicInfoLeftFields(null);
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
    const availableKeys = new Set(
      normalizedRows
        .map((row) => getFamilyCompositionMemberKey(row))
        .filter(Boolean)
    );
    // Map older member key formats to ENTRY_ID|HH_ID keys for backward compatibility.
    const legacyToEntryHhKey = new Map();
    normalizedRows.forEach((row) => {
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
    const cleanedMembers = {};
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

    const previousDeleted = Array.from(existingDeleted);
    const memberChanged =
      Object.keys(cleanedMembers).length !== Object.keys(existingMembers).length;
    const deletedChanged =
      cleanedDeleted.length !== previousDeleted.length ||
      cleanedDeleted.some((key, idx) => key !== previousDeleted[idx]);

    if (!memberChanged && !deletedChanged) {
      return;
    }

    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members: cleanedMembers,
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
    return `\u20B1 ${digits}`;
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
    "occupation",
    "monthlyIncome",
    "typeOfDisability",
  ]);

  function buildFamilyCompositionDefaultEntry(row) {
    return {
      monitoredChild: normalizeFamilyCompositionFieldForStorage(
        "monitoredChild",
        resolveMonitoredChildDefault(row)
      ),
      educationalAttainment: normalizeFamilyCompositionFieldForStorage(
        "educationalAttainment",
        row && row.GRADE_LEVEL
      ),
      occupation: normalizeFamilyCompositionFieldForStorage(
        "occupation",
        row && row.OCCUPATION
      ),
      monthlyIncome: normalizeFamilyCompositionFieldForStorage(
        "monthlyIncome",
        row && row.MONTHLY_INCOME
      ),
      typeOfDisability: normalizeFamilyCompositionFieldForStorage(
        "typeOfDisability",
        normalizeText(row && row.DISABILITY_TYPES) || "None"
      ),
    };
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

    if (!Array.isArray(rows) || rows.length === 0) {
      familyCompositionList.innerHTML = "";
      familyCompositionEmpty.classList.remove("hidden");
      updateFamilyCompositionRestoreButtonVisibility();
      return;
    }

    const sortedRows = rows
      .slice()
      .sort((a, b) => parseAgeForSort(b && b.AGE) - parseAgeForSort(a && a.AGE));
    const membersStore = getFamilyCompositionMembersStore();
    const deletedKeys = getFamilyCompositionDeletedKeysStore();
    const visibleRows = sortedRows.filter(
      (row) => !deletedKeys.has(getFamilyCompositionMemberKey(row))
    );

    familyCompositionList.innerHTML = visibleRows
      .map((row, index) => renderFamilyCompositionMemberAccordion(row, index, membersStore))
      .join("");
    syncGranteeEducationalAttainmentFromBasicToFamilyComposition({
      scheduleAutoSave: false,
    });
    familyCompositionEmpty.classList.toggle("hidden", visibleRows.length > 0);
    updateFamilyCompositionRestoreButtonVisibility();
  }

  function renderFamilyCompositionMemberAccordion(row, index, membersStore) {
    const memberKey = getFamilyCompositionMemberKey(row);
    const encodedKey = escapeHtml(memberKey);
    const entryId = escapeHtml(normalizeText(row && row.ENTRY_ID) || "N/A");
    const name = escapeHtml(normalizeText(row && (row.NAMES || row.NAME)) || "N/A");
    const sex = escapeHtml(normalizeText(row && row.SEX) || "N/A");
    const age = escapeHtml(formatAgeLabel(row && row.AGE));
    const civilStatus = escapeHtml(normalizeText(row && row.CIVIL_STATUS) || "N/A");
    const relation = escapeHtml(
      normalizeText(row && row.RELATION_TO_HH_HEAD) || "N/A"
    );
    const isGrantee = normalizeText(row && row.GRANTEE).toUpperCase() === "YES";
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
    const occupation = getMemberFieldValue(
      membersStore,
      memberKey,
      "occupation",
      row && row.OCCUPATION
    );
    const monthlyIncome = getMemberFieldValue(
      membersStore,
      memberKey,
      "monthlyIncome",
      row && row.MONTHLY_INCOME
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
    const canDelete = !isGranteeFamilyCompositionRow(row);
    const badge = `<span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">${escapeHtml(memberStatusLabel)}</span>`;

    return `
      <details class="group bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-lg" ${index === 0 ? "open" : ""}>
        <summary class="cursor-pointer list-none p-4 flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <div class="font-semibold text-slate-900 dark:text-slate-100">${entryId} - ${name}</div>
              ${granteeTag}
            </div>
            <div class="text-sm font-semibold text-slate-500 dark:text-slate-100 mt-1">${relation} &bull; ${sex} &bull; ${age} &bull; ${civilStatus}</div>
          </div>
          <div class="ml-auto flex items-center gap-3">
            ${badge}
            ${canDelete
              ? `<button type="button" data-fc-delete-member="${encodedKey}" class="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100">Delete</button>`
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
      ...options,
    };
    if (!currentCsrRecord || !currentCsrRecord.csrId) {
      return false;
    }
    const members = collectFamilyCompositionEditsFromDom();
    const deletedMemberKeys = Array.from(getFamilyCompositionDeletedKeysStore());
    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members,
      deletedMemberKeys,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };
    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(currentCsrRecord.familyComposition.savedAt);
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setFamilyCompositionSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
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
    deletedKeys.add(memberKey);
    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members: collectFamilyCompositionEditsFromDom(),
      deletedMemberKeys: Array.from(deletedKeys),
      savedAt: new Date().toISOString(),
      lastSaveMode: "manual",
    };
    const saved = await persistFamilyCompositionEdits({ isAutoSave: false });
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
        const name = escapeHtml(normalizeText(row && (row.NAMES || row.NAME)) || "N/A");
        const sex = escapeHtml(normalizeText(row && row.SEX) || "N/A");
        const age = escapeHtml(formatAgeLabel(row && row.AGE));
        const civilStatus = escapeHtml(normalizeText(row && row.CIVIL_STATUS) || "N/A");
        const relation = escapeHtml(normalizeText(row && row.RELATION_TO_HH_HEAD) || "N/A");
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
    const saved = await persistFamilyCompositionEdits({ isAutoSave: false });
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
    const rowsByKey = new Map(
      latestFamilyCompositionRows
        .map((row) => [getFamilyCompositionMemberKey(row), row])
        .filter(([memberKey]) => Boolean(memberKey))
    );
    const nextMembers = {};
    let resetCount = 0;

    Object.keys(currentMembers).forEach((memberKey) => {
      const currentEntry =
        currentMembers[memberKey] && typeof currentMembers[memberKey] === "object"
          ? currentMembers[memberKey]
          : {};
      const row = rowsByKey.get(memberKey);
      if (!row) {
        nextMembers[memberKey] = currentEntry;
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

    currentCsrRecord.familyComposition = {
      ...(currentCsrRecord.familyComposition || {}),
      members: nextMembers,
      deletedMemberKeys: preservedDeletedMemberKeys,
      savedAt: new Date().toISOString(),
      lastSaveMode: "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
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
      !currentCsrRecord.csrId
    ) {
      return false;
    }

    const html = getCaseDevelopmentEditorHtml();
    currentCsrRecord.caseDevelopment = {
      ...(currentCsrRecord.caseDevelopment || {}),
      html,
      savedAt: new Date().toISOString(),
      lastSaveMode: config.isAutoSave ? "autosave" : "manual",
    };

    try {
      await persistCsrRecord(currentCsrRecord);
      const savedAtLabel = formatSaveTimeLabel(currentCsrRecord.caseDevelopment.savedAt);
      const saveLabel = config.isAutoSave ? "Auto-saved" : "Saved";
      setCaseDevelopmentSaveStatus(`${saveLabel} ${savedAtLabel}`, "success");
      return true;
    } catch (_) {
      const failedLabel = config.isAutoSave ? "Auto-save failed" : "Save failed";
      setCaseDevelopmentSaveStatus(failedLabel, "error");
      if (config.showToastOnError) {
        showToast("Unable to save Case Development right now.");
      }
      return false;
    }
  }

  function handleCaseDevelopmentBackClick() {
    if (caseDevelopmentAutoSaveTimer) {
      window.clearTimeout(caseDevelopmentAutoSaveTimer);
      caseDevelopmentAutoSaveTimer = null;
    }
    void persistCaseDevelopmentDetails({ isAutoSave: true, showToastOnError: false });
    setActiveCsrStep(2);
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

    return null;
  }

  function fillBasicInfoLeftFields(granteeRow) {
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
    if (basicSexInput) {
      basicSexInput.value = safeValue(granteeRow && granteeRow.SEX);
    }
    if (basicBirthdayInput) {
      basicBirthdayInput.value = safeValue(granteeRow && granteeRow.BIRTHDAY);
    }
    if (basicAgeInput) {
      basicAgeInput.value = safeValue(granteeRow && granteeRow.AGE);
    }
    if (basicCivilStatusInput) {
      basicCivilStatusInput.value = safeValue(granteeRow && granteeRow.CIVIL_STATUS);
    }
    if (basicIpAffiliationInput) {
      const ipAffiliation = safeValue(granteeRow && granteeRow.IP_AFFILIATION);
      basicIpAffiliationInput.value = ipAffiliation || "NONE";
    }
    if (basicClientStatusOnExitInput) {
      basicClientStatusOnExitInput.value = safeValue(granteeRow && granteeRow.CLIENT_STATUS);
    }
    setEducationalAttainmentFieldValue(granteeRow && granteeRow.GRADE_LEVEL, true);
    const nationalIdField = document.getElementById("edit-national-id");
    if (nationalIdField && !normalizeText(nationalIdField.value)) {
      nationalIdField.value = formatNationalId(safeValue(granteeRow && granteeRow.PCN));
    }
    const prefilledPrevWellBeing = buildPrevWellBeingLabel(
      granteeRow && granteeRow.LOWB,
      granteeRow && granteeRow["SWDI SCORE"]
    );
    const editPrevWellBeingField = document.getElementById("edit-prev-wellbeing");
    if (editPrevWellBeingField && !normalizeText(editPrevWellBeingField.value)) {
      editPrevWellBeingField.value = prefilledPrevWellBeing;
    }

    const rowYearOfRegistration = safeValue(granteeRow && granteeRow["YEAR OF REGISTRATION"]);
    const yearField = document.getElementById("edit-year-registration");
    if (yearField && !normalizeText(yearField.value)) {
      yearField.value = rowYearOfRegistration;
    }

    const yearsInProgramField = document.getElementById("edit-years-program");
    if (yearsInProgramField && !normalizeText(yearsInProgramField.value)) {
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
    const requiredMappedKeys = [
      "religion",
      "yearOfRegistration",
      "clientStatusOnExit",
      "prevWellBeingLevel",
    ];
    return requiredMappedKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(prefilled, key)
    );
  }

  function fillBasicInfoLeftFieldsFromPrefilled(prefilled) {
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
    if (basicSexInput) {
      basicSexInput.value = normalizeText(prefilled.sex);
    }
    if (basicBirthdayInput) {
      basicBirthdayInput.value = normalizeText(prefilled.birthday);
    }
    if (basicAgeInput) {
      basicAgeInput.value = normalizeText(prefilled.age);
    }
    if (basicCivilStatusInput) {
      basicCivilStatusInput.value = normalizeText(prefilled.civilStatus);
    }
    if (basicIpAffiliationInput) {
      const ip = normalizeText(prefilled.ipAffiliation);
      basicIpAffiliationInput.value = ip || "NONE";
    }
    if (basicClientStatusOnExitInput) {
      basicClientStatusOnExitInput.value = normalizeText(prefilled.clientStatusOnExit);
    }
    setEducationalAttainmentFieldValue(prefilled.educationalAttainment, true);
    const nationalIdField = document.getElementById("edit-national-id");
    if (nationalIdField && !normalizeText(nationalIdField.value)) {
      nationalIdField.value = formatNationalId(normalizeText(prefilled.nationalId));
    }
    const editPrevWellBeingField = document.getElementById("edit-prev-wellbeing");
    if (editPrevWellBeingField && !normalizeText(editPrevWellBeingField.value)) {
      editPrevWellBeingField.value = normalizeText(prefilled.prevWellBeingLevel);
    }

    const yearField = document.getElementById("edit-year-registration");
    if (yearField && !normalizeText(yearField.value)) {
      yearField.value = normalizeText(prefilled.yearOfRegistration);
    }

    const yearsInProgramField = document.getElementById("edit-years-program");
    if (yearsInProgramField && !normalizeText(yearsInProgramField.value)) {
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

  async function getCsrRecordById(csrId, municipalityHint) {
    if (!csrId) {
      return null;
    }
    if (isHttpContext()) {
      const municipality = normalizeText(
        municipalityHint || getActiveMunicipalityForCards()
      ).toUpperCase();
      const byHint = await fetchServerCsrRecordById(csrId, municipality);
      if (byHint) {
        return byHint;
      }
      // Safe fallback: retry without municipality filter in case session/cache
      // state is stale across browser profiles.
      if (municipality) {
        const byIdOnly = await fetchServerCsrRecordById(csrId, "");
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
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () =>
        reject(request.error || new Error("Failed to load CSR record."));
    });
  }

  async function fetchServerCsrRecordById(csrId, municipality) {
    if (!isHttpContext()) {
      return null;
    }
    const query = new URLSearchParams({ id: String(csrId) });
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

  async function getServerCsrRecordsByMunicipality(municipality) {
    const safeMunicipality = normalizeText(municipality).toUpperCase();
    if (!safeMunicipality || !isHttpContext()) {
      return null;
    }
    try {
      const query = new URLSearchParams({ municipality: safeMunicipality });
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

  async function saveServerCsrRecord(municipality, record) {
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

  async function putCsrRecordLocalCache(record) {
    try {
      const db = await openCsrDb();
      await putCsrRecord(db, record);
    } catch (_) {
      // Ignore local cache failures; primary storage is file-based in HTTP mode.
    }
  }

  async function getPrimaryCsrRecordsForMunicipality(municipality) {
    const safeMunicipality = normalizeText(municipality).toUpperCase();
    if (!safeMunicipality) {
      return [];
    }

    if (isHttpContext()) {
      const serverRecords = await getServerCsrRecordsByMunicipality(safeMunicipality);
      if (Array.isArray(serverRecords)) {
        return serverRecords;
      }
    }

    const db = await openCsrDb();
    return getAllCsrRecords(db);
  }

  async function saveCsrRecordToPrimaryStorage(record) {
    const municipality = getRecordMunicipality(record);
    let savedToPrimary = false;

    if (isHttpContext() && municipality) {
      savedToPrimary = await saveServerCsrRecord(municipality, record);
    } else if (!isHttpContext()) {
      const db = await openCsrDb();
      await putCsrRecord(db, record);
      savedToPrimary = true;
    }

    await putCsrRecordLocalCache(record);
    return savedToPrimary || !isHttpContext();
  }

  async function restoreCsrWorkspaceFromViewState() {
    const viewState = getCsrViewState();
    if (!viewState || viewState.mode !== "workspace") {
      return false;
    }

    const csrId = String(viewState.csrId || "").trim();
    if (!csrId) {
      clearCsrViewState();
      return false;
    }

    try {
      const savedRecord = await getCsrRecordById(csrId);
      if (!savedRecord) {
        clearCsrViewState();
        return false;
      }
      const requestedStep = Number(viewState.activeStep || savedRecord.activeStep || 1);
      return openCsrWorkspaceFromRecord(savedRecord, requestedStep);
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
        targetMunicipality || activeMunicipality
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
      const opened = await openCsrWorkspaceFromRecord(savedRecord, requestedStep);
      if (opened) {
        showToast(`CSR ${deepLink.csrId} opened from link.`, "success", 2200);
      }
      return opened;
    } catch (_) {
      showToast("Unable to open CSR from link right now.", "error", 3200);
      return false;
    }
  }

  async function openCsrWorkspaceFromRecord(savedRecord, requestedStep) {
    if (!savedRecord || !savedRecord.csrId) {
      return false;
    }
    currentCsrRecord = savedRecord;
    applySavedBasicInfoEditDetails();
    applySavedCaseDevelopmentDetails();
    applySavedInterventionsProvidedDetails();
    applySavedHouseholdInterventionPlanDetails();
    applySavedRecommendationDetails();
    showCsrWorkspace();
    const resolvedStep =
      Number.isInteger(requestedStep) &&
      requestedStep >= 1 &&
      requestedStep <= CSR_STEP_COUNT
        ? requestedStep
        : 1;
    setActiveCsrStep(resolvedStep);
    setCsrViewState({
      mode: "workspace",
      csrId: String(savedRecord.csrId || ""),
      activeStep: resolvedStep,
    });
    void populateBasicInfoFromSelectedCard(
      savedRecord && savedRecord.cardData,
      savedRecord && savedRecord.csrId
    );
    void populateFamilyCompositionFromSelectedCard(
      savedRecord && savedRecord.cardData
    );
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

  async function createOrGetCsrRecord(cardData) {
    const municipality = normalizeText(cardData && cardData.municipality).toUpperCase();
    const existingRecords = await getPrimaryCsrRecordsForMunicipality(municipality);
    const existingRecord = findExistingCsrRecord(existingRecords, cardData);

    if (existingRecord) {
      const mergedRecord = {
        ...existingRecord,
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

    const existingIds = existingRecords.map((record) => String(record.csrId || ""));
    const csrId = generateUniqueCsrId(existingIds);
    const record = {
      csrId,
      createdAt: new Date().toISOString(),
      activeStep: 1,
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

  async function getExistingCsrRecordForCard(cardData) {
    const municipality = normalizeText(cardData && cardData.municipality).toUpperCase();
    if (!municipality) {
      return null;
    }
    const existingRecords = await getPrimaryCsrRecordsForMunicipality(municipality);
    return findExistingCsrRecord(existingRecords, cardData);
  }

  async function getExistingCsrRecordForCardSafe(cardData) {
    try {
      return await getExistingCsrRecordForCard(cardData);
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
    const saved = await saveCsrRecordToPrimaryStorage(record);
    if (!saved) {
      throw new Error("Failed to save CSR record to primary storage.");
    }
  }

})();
