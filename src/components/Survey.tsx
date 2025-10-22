'use client';

import { useMemo } from 'react';
import 'survey-core/survey-core.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';

// ====== 設定 ======
const DEFAULT_BASE = '/survey-js/hcg2025-exp2/rewrite';

const SUBJECTS = [
  'Subject 1',
  'Subject 2',
  'Subject 3',
  'Subject 4',
  'Subject 5',
];

const PERSONAS = [
  'Persona 1',
  'Persona 2',
  'Persona 3',
  'Persona 4',
  'Persona 5',
];

type Props = {
  baseUrl?: string;
  subjects?: string[]; // ラベル差し替え用
  personas?: string[]; // ラベル差し替え用
};

// ---------- ユーティリティ（インデックス規則） ----------
/** 1..5 を想定：index = (subjectId - 1) * 5 + personaId → 1..25 */
function idx(subjectId: number, personaId: number): number {
  return (subjectId - 1) * 5 + personaId;
}
function z4(n: number): string {
  return n.toString().padStart(4, '0');
}

// Fisher–Yates シャッフル（出題順をランダムにしたい場合）
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    [a[i], a[r]] = [a[r], a[i]];
  }
  return a;
}

/**
 * 25問を生成：
 *  各問は (subjectId, personaId) のペア。
 *  問題文は「ペルソナ personaId」。
 *  選択肢は「そのペルソナ personaId の全5サブジェクト画像」で seed = personaId に固定。
 *  正解は subjectId。
 */
export default function SurveyComponent(props: Props) {
  const base = props.baseUrl ?? DEFAULT_BASE;
  const subjects = props.subjects ?? SUBJECTS;
  const personas = props.personas ?? PERSONAS;

  const model = useMemo(() => {
    // 25ペアを列挙
    const pairs: Array<{ s: number; p: number }> = [];
    for (let s = 1; s <= 5; s++) {
      for (let p = 1; p <= 5; p++) {
        pairs.push({ s, p });
      }
    }

    // 出題順：必要に応じてシャッフル
    // const order = shuffle(pairs);
    const order = pairs; // ★ デバッグ時は固定順（1→25）

    // console.log(order);

    const pages = [
      {
        name: 'intro',
        elements: [
          {
            type: 'html',
            name: 'intro_html',
            html: `
              <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                <h3>ペルソナ × サブジェクト 識別テスト</h3>
                <p>
                  各問題では、<strong>指定されたペルソナ</strong>が提示されます。<br/>
                  そのペルソナで生成された<strong>5つの画像</strong>の中から、<u>指示されたサブジェクト</u>を選んでください。
                </p>
                <p>全25問です。「次へ」で開始してください。</p>
              </div>
            `,
          },
        ],
      },

      // 25問
      ...order.map(({ s, p }, idxInOrder) => {
        const seed = p; // 重要：ペルソナIDに応じて seed を固定 (_1.._5)
        console.log(`${s}_${p}`);

        // サブジェクトs
        // ペルソナp

        // 選択肢（そのペルソナ p に対する 5サブジェクトの画像）
        const choices = Array.from({ length: 5 }, (_, k) => {
          // const subjectId = k + 1; // 1..5
          const filename = `pair_${z4(s+k*5)}_${p}.png`;
          const img = `${base}/${filename}`;

          //console.log(s);
          //console.log(p);
          console.log(filename);

          return {
            value: `pair_${z4(s+k*5)}_${p}`, // 回答値
            imageLink: img,            // 選択肢画像
          };
        });

        //console.log(choices);

        // 正解（この問題の (s, p) の s）
        const correctValue = `sub_${s}`;

        return {
          name: `q_${s}_${p}`,
          elements: [
            {
              type: 'html',
              name: `q_${s}_${p}_title`,
              html: `
                <div style="margin-bottom: 8px;">
                  <strong>問題 ${idxInOrder + 1} / 25</strong>
                </div>
                <div style="margin-bottom: 8px;">
                  指定のペルソナ：<strong>${personas[p - 1]}</strong><br/>
                  <small>※ 選択肢はこのペルソナで生成された 5 サブジェクト（seed = ${seed}）です。</small>
                </div>
                <div style="text-align:center;">
                  <img src="/survey-js/hcg2025-exp2/base/${String(s).padStart(2, '0')}_${seed}.png"
                      alt="ベース画像"
                      style="max-width:160px;height:auto;border:1px solid #ccc;border-radius:8px;" />
                </div>
              `,
            },
            {
              type: 'imagepicker',
              name: `ans_${s}_${p}`,
              isRequired: true,
              colCount: 5,
              choicesOrder: 'random',
              choices,
              imageWidth: 160,
              imageHeight: 160,
            },
            // 正解を隠しフィールドに保持（採点用）
            {
              type: 'text',
              name: `key_${s}_${p}`,
              defaultValue: correctValue,
              visible: false,
              readOnly: true,
            },
          ],
        };
      }),
    ];

    const surveyJson = {
      title: 'Persona × Subject Test',
      showProgressBar: 'top',
      pages,
    };

    const m = new Model(surveyJson);

    // 完了時に採点
    m.onComplete.add((sender) => {
      const data = sender.data as Record<string, unknown>;
      let correct = 0;
      let total = 0;

      for (let s = 1; s <= 5; s++) {
        for (let p = 1; p <= 5; p++) {
          const ans = data[`ans_${s}_${p}`];
          const key = data[`key_${s}_${p}`];
          if (typeof ans !== 'undefined' && typeof key !== 'undefined') {
            total += 1;
            if (ans === key) correct += 1;
          }
        }
      }

      const pct = total ? ((correct / total) * 100).toFixed(1) : '0.0';
      console.log('result/raw:', data);
      console.log(`score: ${correct} / ${total} (${pct}%)`);
      alert(
        `結果: ${correct} / ${total} 正解（${pct}%）\n\n` +
        `※ 詳細はブラウザのコンソールに出力しています。`
      );
    });

    return m;
  }, [base, subjects, personas]);

  return (
    <main style={{ padding: 24 }}>
      <Survey model={model} />
    </main>
  );
}




// export default function SurveyComponent() {
//   const survey = new Model(surveyJson);
//   const alertResults = useCallback((sender: Model) => {
//     const data = sender.data;

//     console.log(data);

//     const json = JSON.stringify(data);
//     const encoded = encodeURIComponent(json);
//     const url = `https://script.google.com/macros/s/AKfycbyOMSmmLT8wye5xt-0wdx83lNlRL1mwOGe-VD2zOlxTp9IcuOCq2tTNo2pbDnCgPaUvGA/exec?data="${encoded}"`;
//     fetch(url)
//       .then(res => res.text())
//       .then(result => alert("成功:\n" + result))
//       .catch(err => alert("失敗:\n" + err));

//   }, []);

//   survey.onComplete.add(alertResults);

//   return (
//     <Survey model={survey} />
//   );
// }

// function saveSurveyResults(url: string, json: object) {
//   fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     body: JSON.stringify(json)
//   })
//   .then(response => {
//     if (response.ok) {
//       // Handle success
//     } else {
//       // Handle error
//     }
//   })
//   .catch(error => {
//     // Handle error
//   });
// }