'use client'

import { useCallback } from 'react';
import 'survey-core/survey-core.css';
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'

// const SURVEY_ID = 1;

const questionTitles = [
  "活発で、外向的だと思う",
  "他人に不満をもち、もめごとを起こしやすいと思う",
  "しっかりしていて、自分に厳しいと思う",
  "心配性で、うろたえやすいと思う",
  "新しいことが好きで、変わった考えをもつと思う",
  "ひかえめで、おとなしいと思う",
  "人に気をつかう、やさしい人間だと思う",
  "だらしなく、うっかりしていると思う",
  "冷静で、気分が安定していると思う",
  "発想力に欠けた、平凡な人間だと思う"
];

// 5人 × 5枚（1_1.png 〜 5_5.png）としてパスを生成
const imagePaths = Array.from({ length: 5 }, (_, i) =>
  Array.from({ length: 5 }, (_, j) => `/images-07/${i + 1}_${j + 1}.png`)
).flat();

// ランダムにシャッフル
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const shuffledImages = shuffleArray(imagePaths);

// 各画像ページを生成
// 各画像ページを生成
const imageRatingPages = shuffledImages.map((imagePath, imgIndex) => {
  const fileName = imagePath.split("/").pop()?.replace(".png", "") || `img${imgIndex + 1}`;
  const elements = [
    {
      type: "html",
      name: "instruction_text",
      html: `
        <div style="margin-bottom: 20px;">
          <p><strong>1 から 10 までのことばが画像のキャラクターにどのくらい当てはまるかについて，下の枠内の 1 から 7 までの数字のうちもっとも適切なものを選択してください。文章全体を総合的に見て，画像のキャラクターにどれだけ当てはまるかを評価してください。</strong></p>
          <ol>
            <li>活発で，外向的だと思う</li>
            <li>他人に不満をもち，もめごとを起こしやすいと思う</li>
            <li>しっかりしていて，自分に厳しいと思う</li>
            <li>心配性で，うろたえやすいと思う</li>
            <li>新しいことが好きで，変わった考えをもつと思う</li>
            <li>ひかえめで，おとなしいと思う</li>
            <li>人に気をつかう，やさしい人間だと思う</li>
            <li>だらしなく，うっかりしていると思う</li>
            <li>冷静で，気分が安定していると思う</li>
            <li>発想力に欠けた，平凡な人間だと思う</li>
          </ol>
          <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; text-align: center; margin: 10px 0;">
            <thead>
              <tr>
                <th>全く違うと思う</th>
                <th>おおよそ違うと思う</th>
                <th>少し違うと思う</th>
                <th>どちらでもない</th>
                <th>少しそう思う</th>
                <th>まあまあそう思う</th>
                <th>強くそう思う</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>7</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    },
    ...questionTitles.flatMap((title, qIndex) => [
      {
        type: "html",
        name: `${fileName}_q${qIndex + 1}_image`,
        html: `
          <div style="text-align: center; margin: 20px 0;">
            <img src="https://ysdzm.github.io/survey-js/${imagePath}" width="300" />
          </div>
        `
      },
      {
        type: "rating",
        name: `${fileName}_q${qIndex + 1}`,
        title,
        isRequired: true,
        rateMin: 1,
        rateMax: 7,
        description: "1: 全く違うと思う　〜　7: 強くそう思う",
        displayMode: "buttons"
      }
    ])
  ];

  return { elements };
});


// SurveyJSON 最終構造
const surveyJson = {
  title: "画像印象評価テスト",
  showProgressBar: "top",
  pages: [
    {
      name: "intro",
      elements: [
        {
          type: "html",
          name: "intro_text",
          html: `
            <h3>画像印象評価テストへようこそ</h3>
            <p>加藤昇平研究室 修士2年 安田隆哉</p>
            <p>調査にご協力いただきありがとうございます。</p>
            <p>この調査では、髪型と髪色の異なるキャラクター画像の印象を評価していただきます。</p>

            <hr />
            <p><strong>以下のような項目について、1〜7 のスケールでお答えください。</strong></p>
            <p>
              1 から 10 までの文章について、<br>
              「どのくらいキャラクターに当てはまるか」を 1〜7 の中で最も適切な数字で評価してください。
            </p>
            <p>
              1: 全く違うと思う<br>
              2: おおよそ違うと思う<br>
              3: 少し違うと思う<br>
              4: どちらでもない<br>
              5: 少しそう思う<br>
              6: まあまあそう思う<br>
              7: 強くそう思う
            </p>
            <p>
              評価する文の例：<br>
              「私は画像のキャラクターのことを……<br>
              （1）活発で，外向的だと思う」など
            </p>
            <hr />
            <p>キャラクター画像は合計25枚ございます。</p>
            <p>25体×10項目なので250項目回答いただくことになります。</p>
            <p><strong>20~30分ほど時間の取れるタイミングに実施してください。</strong></p>

            <p>「Next」をクリックして開始してください。</p>
          `
        }
      ]
    },
    {
      elements: [
        {
          name: "学籍番号",
          title: "学籍番号",
          type: "text",
          isRequired: true,
        },
        {
          name: "氏名",
          title: "氏名",
          type: "text",
          isRequired: true,
        }
      ]
    },
    ...imageRatingPages.slice(0, 25) 
  ],
  // showPreviewBeforeComplete: true,
};


export default function SurveyComponent() {
  const survey = new Model(surveyJson);
  const alertResults = useCallback((sender: Model) => {
    const data = sender.data;

    console.log(data);

    const json = JSON.stringify(data);
    const encoded = encodeURIComponent(json);
    const url = `https://script.google.com/macros/s/AKfycbyOMSmmLT8wye5xt-0wdx83lNlRL1mwOGe-VD2zOlxTp9IcuOCq2tTNo2pbDnCgPaUvGA/exec?data="${encoded}"`;
    fetch(url)
      .then(res => res.text())
      .then(result => alert("成功:\n" + result))
      .catch(err => alert("失敗:\n" + err));

  }, []);

  survey.onComplete.add(alertResults);

  return (
    <Survey model={survey} />
  );
}

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