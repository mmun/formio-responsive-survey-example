(function bootstrapResponsiveSurveyDemo() {
  const SurveyComponent = Formio.Components.components.survey;
  const BaseComponent = Formio.Components.components.component;

  const defaultQuestions = [
    {
      label: "Little interest or pleasure in doing things.",
      value: "littleInterest"
    },
    {
      label: "Feeling down, depressed, or hopeless.",
      value: "feelingDown"
    },
    {
      label: "Trouble falling or staying asleep, or sleeping too much.",
      value: "sleepTrouble"
    },
    {
      label: "Feeling tired or having little energy.",
      value: "lowEnergy"
    }
  ];

  const defaultValues = [
    { label: "Not at all", value: "notAtAll" },
    { label: "Several days", value: "severalDays" },
    { label: "More than half the days", value: "moreThanHalf" },
    { label: "Nearly every day", value: "nearlyEveryDay" }
  ];

  class ResponsiveSurveyComponent extends SurveyComponent {
    static schema() {
      return SurveyComponent.schema({
        type: "responsiveSurvey",
        label: "Responsive Survey",
        key: "responsiveSurvey",
        questions: defaultQuestions,
        values: defaultValues,
        breakpoint: 767
      });
    }

    static get builderInfo() {
      return {
        title: "Responsive Survey",
        icon: "list-check",
        group: "advanced",
        weight: 25,
        documentation: "",
        schema: ResponsiveSurveyComponent.schema()
      };
    }

    constructor(component, options, data) {
      super(component, options, data);
      this.currentQuestionIndex = 0;
      this.windowResizeHandler = this.handleWindowResize.bind(this);
      this.mobileMode = false;
    }

    get breakpoint() {
      return Number(this.component.breakpoint) || 767;
    }

    isMobileMode() {
      return (
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: " + this.breakpoint + "px)").matches
      );
    }

    normalizeQuestions() {
      return (this.component.questions || []).map(function normalizeQuestion(
        question,
        index
      ) {
        return {
          label: question.label || "Question " + (index + 1),
          value: question.value || "question" + (index + 1)
        };
      });
    }

    normalizeValues() {
      return (this.component.values || []).map(function normalizeValue(
        option,
        index
      ) {
        if (typeof option === "string") {
          return { label: option, value: "option" + index };
        }

        return {
          label: option.label || "Option " + (index + 1),
          value: option.value || "option" + index
        };
      });
    }

    render(children) {
      this.mobileMode = this.isMobileMode();
      if (!this.mobileMode) {
        return super.render(children);
      }

      const questions = this.normalizeQuestions();
      const values = this.normalizeValues();
      const total = questions.length;

      if (!total) {
        return '<div class="alert alert-warning">No survey questions found.</div>';
      }

      this.currentQuestionIndex = Math.max(
        0,
        Math.min(this.currentQuestionIndex, total - 1)
      );

      const question = questions[this.currentQuestionIndex];
      const currentValue = ((this.dataValue || {})[question.value]) || "";
      const optionMarkup = values
        .map(
          function renderOption(option) {
            const selected = currentValue === option.value;
            return (
              '<label class="phq-mobile-survey__option' +
              (selected ? " is-selected" : "") +
              '">' +
              '<input type="radio" ref="mobileOptionInput" name="' +
              this.id +
              "-" +
              question.value +
              '" value="' +
              option.value +
              '" data-question-key="' +
              question.value +
              '"' +
              (selected ? " checked" : "") +
              " />" +
              "<span>" +
              option.label +
              "</span>" +
              "</label>"
            );
          }.bind(this)
        )
        .join("");

      const dotsMarkup = questions
        .map(
          function renderDot(unusedQuestion, index) {
            return (
              '<span class="phq-mobile-survey__dot' +
              (index === this.currentQuestionIndex ? " is-active" : "") +
              '"></span>'
            );
          }.bind(this)
        )
        .join("");

      return (
        '<div class="phq-mobile-survey">' +
        '<div class="phq-mobile-survey__meta">' +
        '<span class="phq-mobile-survey__step">Question ' +
        (this.currentQuestionIndex + 1) +
        " of " +
        total +
        "</span>" +
        '<div class="phq-mobile-survey__dots">' +
        dotsMarkup +
        "</div>" +
        "</div>" +
        '<div class="phq-mobile-survey__card">' +
        '<h3 class="phq-mobile-survey__question">' +
        question.label +
        "</h3>" +
        '<div class="phq-mobile-survey__options">' +
        optionMarkup +
        "</div>" +
        "</div>" +
        '<div class="phq-mobile-survey__footer">' +
        '<button type="button" class="btn btn-default" ref="mobilePrev"' +
        (this.currentQuestionIndex === 0 ? " disabled" : "") +
        ">Previous</button>" +
        '<button type="button" class="btn btn-primary" ref="mobileNext"' +
        (this.currentQuestionIndex === total - 1 ? " disabled" : "") +
        ">Next</button>" +
        "</div>" +
        "</div>"
      );
    }

    attach(element) {
      this.mobileMode = this.isMobileMode();

      if (!this.mobileMode) {
        this.bindResizeListener();
        return super.attach(element);
      }

      const attached = BaseComponent.prototype.attach.call(this, element);
      this.loadRefs(element, {
        mobileOptionInput: "multiple",
        mobilePrev: "single",
        mobileNext: "single"
      });

      (this.refs.mobileOptionInput || []).forEach(
        function attachOption(input) {
          this.addEventListener(input, "change", this.handleOptionChange.bind(this));
        }.bind(this)
      );

      if (this.refs.mobilePrev) {
        this.addEventListener(
          this.refs.mobilePrev,
          "click",
          this.handlePrevClick.bind(this)
        );
      }

      if (this.refs.mobileNext) {
        this.addEventListener(
          this.refs.mobileNext,
          "click",
          this.handleNextClick.bind(this)
        );
      }

      this.bindResizeListener();
      return attached;
    }

    bindResizeListener() {
      if (typeof window === "undefined" || this.hasWindowResizeListener) {
        return;
      }

      window.addEventListener("resize", this.windowResizeHandler);
      this.hasWindowResizeListener = true;
    }

    removeResizeListener() {
      if (typeof window === "undefined" || !this.hasWindowResizeListener) {
        return;
      }

      window.removeEventListener("resize", this.windowResizeHandler);
      this.hasWindowResizeListener = false;
    }

    handleWindowResize() {
      const nextMode = this.isMobileMode();
      if (nextMode !== this.mobileMode) {
        this.mobileMode = nextMode;
        this.redraw();
      }
    }

    handleOptionChange(event) {
      const questionKey = event.target.getAttribute("data-question-key");
      const updatedValue = Object.assign({}, this.dataValue || {}, {
        [questionKey]: event.target.value
      });

      this.setValue(updatedValue, { modified: true });
      this.triggerChange({ modified: true });

      if (this.currentQuestionIndex < this.normalizeQuestions().length - 1) {
        this.currentQuestionIndex += 1;
      }

      this.redraw();
    }

    handlePrevClick() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex -= 1;
        this.redraw();
      }
    }

    handleNextClick() {
      if (this.currentQuestionIndex < this.normalizeQuestions().length - 1) {
        this.currentQuestionIndex += 1;
        this.redraw();
      }
    }

    detach() {
      this.removeResizeListener();
      return super.detach();
    }
  }

  Formio.Components.addComponent("responsiveSurvey", ResponsiveSurveyComponent);

  const formSchema = {
    display: "form",
    components: [
      {
        type: "textfield",
        key: "patientName",
        label: "Patient name",
        input: true
      },
      {
        type: "responsiveSurvey",
        key: "phqIntake",
        label: "Over the last 2 weeks, how often have you been bothered by the following problems?",
        input: true,
        questions: defaultQuestions,
        values: defaultValues
      },
      {
        type: "button",
        key: "submit",
        label: "Submit",
        action: "submit",
        theme: "primary"
      }
    ]
  };

  const formElement = document.getElementById("form");
  const submissionElement = document.getElementById("submission");

  function renderPreview(schema) {
    formElement.innerHTML = "";

    Formio.createForm(formElement, schema).then(function onFormReady(form) {
      submissionElement.textContent = "Fill out the form to inspect the submission payload.";

      form.on("change", function onChange(event) {
        submissionElement.textContent = JSON.stringify(event.data, null, 2);
      });

      form.on("submit", function onSubmit(submission) {
        submissionElement.textContent = JSON.stringify(submission.data, null, 2);
      });
    });
  }

  renderPreview(formSchema);
})();
