'use client';

import { useMemo } from 'react';
import 'survey-core/survey-core.css'; // 既に使っているテーマに合わせています
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';

// ---- 設定（必要に応じて調整）---------------------------------------------

// 画像のベースパス：
// 1) ローカルの public/ 配下を使うなら → '/images-07'
// 2) GitHub Pages の公開URLを使うなら → 'https://ysdzm.github.io/survey-js/images-07'
const DEFAULT_BASE = '/survey-js/images-07';

const HAIRSTYLES = [
  'Style A',
  'Style B',
  'Style C',
  'Style D',
  'Style E',
];

const NUM_HAIRSTYLES = 5; // 髪型の数
const NUM_COLORS = 5;     // 髪色の数

// -------------------------------------------------------------------------

type Props = {
  /**
   * 画像のベースURL（省略時は DEFAULT_BASE を使用）
   * 例:
   *   - ローカル: '/images-07'
   *   - GH Pages: 'https://ysdzm.github.io/survey-js/images-07'
   */
  baseUrl?: string;

  /**
   * 髪型のラベル（日本語にするならここを差し替え）
   * 例: ['ショートボブ','ポニーテール','ツインテール','ロング','おかっぱ']
   */
  hairstyles?: string[];
};

function makeQuestionPairs(): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let i = 1; i <= NUM_HAIRSTYLES; i++) {
    for (let j = 1; j <= NUM_COLORS; j++) {
      pairs.push([i, j]);
    }
  }
  // Fisher–Yates シャッフル
  for (let k = pairs.length - 1; k > 0; k--) {
    const r = Math.floor(Math.random() * (k + 1));
    [pairs[k], pairs[r]] = [pairs[r], pairs[k]];
  }
  return pairs;
}

export default function SurveyComponent(props: Props) {
  const base = props.baseUrl ?? DEFAULT_BASE;
  const hairstyleLabels = props.hairstyles ?? HAIRSTYLES;

  const model = useMemo(() => {
    const pairs = makeQuestionPairs();

    const pages = [
      {
        name: 'intro',
        elements: [
          {
            type: 'html',
            name: 'intro_html',
            html: `
              <h3>髪型識別テスト</h3>
              <p>各問題では、<strong>指定の髪型</strong>に一致する画像を 1 つ選んでください。</p>
              <p>選択肢は <strong>すべて同じ髪色</strong>です。<u>髪色ではなく髪型の形状</u>で判別してください。</p>
              <p>全部で ${NUM_HAIRSTYLES * NUM_COLORS} 問あります。「次へ」を押すと開始します。</p>
              <hr />
            `,
          },
        ],
      },

      // 25問（5髪型 × 5髪色）
      ...pairs.map(([i, j], idx) => {
        const correctValue = `hs_${i}`;

        // 同じ髪色 j のまま、髪型 1..5 を選択肢にする
        const choices = Array.from({ length: NUM_HAIRSTYLES }, (_, h) => {
          const hairIdx = h + 1; // 1..5
          console.log(`${base}/${hairIdx}_${j}.png`);
          return {
            value: `hs_${hairIdx}`,
            imageLink: `${base}/${hairIdx}_${j}.png`,
            text: hairstyleLabels[hairIdx - 1],
          };
        });

        return {
          name: `q_${i}_${j}`,
          elements: [
            {
              type: 'html',
              name: `q_${i}_${j}_title`,
              html: `
                <div style="margin-bottom: 8px;">
                  <strong>問題 ${idx + 1} / ${NUM_HAIRSTYLES * NUM_COLORS}</strong>
                </div>
                <div style="margin-bottom: 8px;">
                  指定の髪型：<strong>${hairstyleLabels[i - 1]}</strong>
                  <br /><small>※ 選択肢はすべて同じ髪色（色 ${j}）。髪型の形で判別してください。</small>
                </div>
              `,
            },
            {
              type: 'imagepicker',
              name: `ans_${i}_${j}`,
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
              name: `key_${i}_${j}`,
              defaultValue: correctValue,
              visible: false,
              readOnly: true,
            },
          ],
        };
      }),
    ];

    const surveyJson = {
      title: '髪型識別テスト',
      showProgressBar: 'top',
      pages,
    };

    const m = new Model(surveyJson);

    // 完了時に採点
    m.onComplete.add((sender) => {
      const data = sender.data as Record<string, unknown>;
      let correct = 0;
      let total = 0;

      for (let i = 1; i <= NUM_HAIRSTYLES; i++) {
        for (let j = 1; j <= NUM_COLORS; j++) {
          const ans = data[`ans_${i}_${j}`];
          const key = data[`key_${i}_${j}`];
          if (typeof ans !== 'undefined' && typeof key !== 'undefined') {
            total += 1;
            if (ans === key) correct += 1;
          }
        }
      }

      console.log('result/raw:', data);
      console.log(`score: ${correct} / ${total} (${((correct / total) * 100).toFixed(1)}%)`);
      alert(
        `結果: ${correct} / ${total} 正解（${((correct / total) * 100).toFixed(1)}%）\n\n` +
        `※ 詳細はブラウザのコンソールに出力しています。`
      );
    });

    return m;
  }, [base, hairstyleLabels]);

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