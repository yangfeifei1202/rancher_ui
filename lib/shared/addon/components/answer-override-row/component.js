import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { computed, get, set, observer } from '@ember/object';
import { next } from '@ember/runloop';

export default Component.extend({
  scope: service(),
  intl:  service(),
  layout,

  tagName:               '',
  addSubrowQuestions:    null,
  selectedTemplateModel: null,
  removeAnswerOverride:  null,
  answer:                null,
  ownedSubquestions:     null,
  subquestionAnswers:    null,

  actions: {
    removeOverride(answer) {
      if (this.subquestionAnswers) {
        this.removeSubquestionsAndSend(this.subquestionAnswers);
      }

      next(() => {
        get(this, 'removeAnswerOverride')(answer)
      })
    },
  },

  scopeChanged: observer('answer.scope', function() {
    const subquestionAnswers = this.subquestionAnswers || [];
    const { answer } = this;

    if (subquestionAnswers.length > 0) {
      subquestionAnswers.forEach( (sq) => set(sq, 'scope', get(answer, 'scope')));
    }
  }),

  allProjectsAndClusters: computed('scope.allProjects.[]', 'scope.allClusters.[]', 'primaryResource.targets.@each.projectId', function() {
    let out = [];

    get(this, 'scope.allClusters').forEach( (c) => {
      out.pushObject({
        name:      this.intl.t('newMultiClusterApp.overrides.dropdown.allProjects', { clusterName: c.name }),
        value:     c.id,
        group:     this.intl.t('newMultiClusterApp.overrides.dropdown.clusterGroup', { clusterName: c.name }),
        isCluster: true,
      });

      c.get('projects').forEach( (p) => {
        out.pushObject({
          name:      p.name,
          value:     p.id,
          group:     this.intl.t('newMultiClusterApp.overrides.dropdown.clusterGroup', { clusterName: c.name }),
          isProject: true,
        });
      });
    });

    return out;
  }),

  allQuestions: computed('selectedTemplateModel.questions.[]', 'answer.answer', function() {
    let allQuestions = get(this, 'selectedTemplateModel.questions');
    const { answer } = this;
    const questionMatch   = allQuestions.findBy('variable', answer.question);

    let nueQuestions = [];

    allQuestions.forEach( (q) => {
      if (questionMatch && questionMatch.variable === q.variable) {
        if ( q.showSubquestionIf && q.subquestions) {
          let showSubquestionsIfAnswerIs = q.showSubquestionIf;

          if ( answer.answer.toString() === showSubquestionsIfAnswerIs ) {
            this.buildSubquestions(q.subquestions);
          } else {
            if (this.subquestionAnswers && this.subquestionAnswers.length > 0) {
              this.removeSubquestionsAndSend(this.subquestionAnswers);
            }
          }
        }
      }

      nueQuestions.pushObject(q);
    });

    return nueQuestions;
  }),

  buildSubquestions(subQuestions) {
    let subquestionAnswers = this.subquestionAnswers || [];

    subQuestions.forEach( (sq) => {
      let nueOverride = {
        scope:         get(this, 'answer.scope'),
        question:      sq,
        answer:        sq.default,
        isSubQuestion: true,
      };

      subquestionAnswers.pushObject(nueOverride);
    });

    set(this, 'subquestionAnswers', subquestionAnswers);

    get(this, 'addSubrowQuestions')(subquestionAnswers);
  },

  removeSubquestionsAndSend(answers) {
    let removed = [].concat(answers);

    set(this, 'subquestionAnswers', null);

    next(() => {
      get(this, 'removeSubrowQuestions')(removed);
    });
  },

});
