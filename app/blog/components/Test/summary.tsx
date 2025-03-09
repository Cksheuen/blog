import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './index.less';
import { useKnowledgeBase } from '@/context/kb';
import { knowledgeBaseOverview } from '@/api/kb'
import GenerativeBg from '@/components/GenerativeBg';
import '../../../../node_modules/@semi-bot/semi-theme-pinnacle/semi.css'
import style from './index.less'
import drawTree from '@/hooks/drawTree'
import { KbOverviewResponse } from '@/type.d/kb.v1';
import { Avatar } from '@douyinfe/semi-ui';
import { generateAvatar } from '@/utils/avatar';
import { ISpec, VChart } from "@visactor/react-vchart";
import { Radio, RadioGroup } from '@douyinfe/semi-ui';
import { series } from '@visactor/vchart-semi-theme';

interface KeyToValue {
  key: string;
  innerKey: string;
  value: any;
  icon: string
}

interface DetailBtnsProps {
  currentKb?: KbOverviewResponse | undefined;
}

function DetailBtns({
  currentKb
}: DetailBtnsProps) {
  const detailsKeyAndValue: KeyToValue[] = [
    {
      key: 'questionCount',
      innerKey: 'count',
      value: '题目总数',
      icon: 'i-carbon-list-numbered'
    },
    {
      key: 'statistic',
      innerKey: 'score',
      value: 'Score',
      icon: 'i-carbon-chart-radar'
    },
    {
      key: 'detail',
      innerKey: 'price',
      value: '金币',
      icon: 'i-carbon-pricing-container'
    }

  ]

  const [nowSelected, setNowSelected] = useState('people');
  const data = [
    { type: 'data', value: currentKb?.statistic.correctCount, formula: '已做', texture: 'horizontal-line', color: '#00FF00' },
    { type: 'data', value: currentKb?.statistic.incorrectCount, formula: '错题', texture: 'circle', color: '#FF0000' },
    { type: 'data', value: currentKb?.statistic.proficiency, formula: '未做', texture: 'vertical-line', color: '#0000FF' },
  ];

  const commonSpec = {
    type: 'pie',
    data: [
      {
        id: 'id0',
        values: data
      }
    ],
    outerRadius: 0.8,
    innerRadius: 0.5,
    padAngle: 0.6,
    valueField: 'value',
    pie: {
      style: {
        cornerRadius: 10
      },
      state: {
        hover: {
          outerRadius: 0.85,
          stroke: 'rgb(120, 53, 15)',
          lineWidth: 1
        },
        selected: {
          outerRadius: 0.85,
          stroke: 'rgb(120, 53, 15)',
          lineWidth: 1
        }
      }
    },
    indicator: {
      visible: true,
      trigger: 'hover',
      limitRatio: 0.4,
      title: {
        visible: true,
        autoFit: true,
        style: {
          fontWeight: 'bolder',
          fontFamily: 'Times New Roman',
          fill: '#888',
          text: datum => {
            const d = datum ?? data[0];
            return d['formula'];
          }
        }
      },
      content: [
        {
          visible: true,
          style: {
            fontSize: 20,
            fill: 'orange',
            fontWeight: 'bolder',
            fontFamily: 'Times New Roman',
            text: datum => {
              const d = datum ?? data[0];
              return d['type'];
            }
          }
        },
        {
          visible: true,
          style: {
            fontSize: 18,
            fill: 'orange',
            fontFamily: 'Times New Roman',
            text: datum => {
              const d = datum ?? data[0];
              return d['value'];
            },
          }
        }
      ]
    },
    legends: {
      visible: true,
      orient: 'right',
      item: {
        shape: {
          style: {
            symbolType: 'circle',
            texture: datum => datum['texture']
          }
        }
      }
    },
    tooltip: {
      mark: {
        content: [
          {
            key: datum => datum['type'],
            value: datum => datum['value'] + '%'
          }
        ]
      }
    },
    categoryField: 'formula',
    background: 'transparent',
    color: ['rgb(245, 158, 11)', 'rgb(252, 211, 77)', 'rgb(217, 119, 6)'],
  };

  return (
    <div className='w-100'>
      <div className={`${style.btn_container} text-amber-5 text-4 bg-amber-`}>
        {
          detailsKeyAndValue.map((item) => (
            <div
              className={`${style.detail_item_btn} 
            transition-all flex items-center justify-center flex-col gap-1
            overflow-hidden
            `}
              key={item.key}
            >
              <span className={`${item.icon} text-6 ${style.icon}`}></span>
              <span>{item.key === 'detail' && currentKb?.[item.key]?.[item.innerKey] === 0 ? 'free' : currentKb?.[item.key]?.[item.innerKey]}</span>
              <span>
                {item.value}
              </span>

            </div>
          ))
        }
      </div>

      <div className={``}>
        <VChart
          spec={{
            ...commonSpec,
          } as ISpec}
          style={{ height: '20rem', width: '25rem' }}
        />
      </div>
    </div>
  )
}

interface PeopleListProps {
  people: KbOverviewResponse['people'] | KbOverviewResponse['managerCount'];
  selectNewPeopleList: (new_key: string) => void
}

function PeopleList({
  people, selectNewPeopleList
}: PeopleListProps) {
  const ToSelectedKey = [
    {
      key: 'managerCount',
      value: '管理员',
      icon: 'i-carbon-user-certification'
    },
    {
      key: 'people',
      value: '用户',
      icon: 'i-carbon-user'
    }
  ]
  const [now, setNow] = useState<string>('managerCount')

  const select = (new_key: string) => {
    selectNewPeopleList(new_key)
    setNow(new_key)
  }

  return (
    <div>
      <div className='flex items-center justify-center bg-white p-4 pb-0 rd-t-8 gap-3 text-amber-9 font-800 text-5'>
        {
          ToSelectedKey.map((item) => (
            <span
              className={`hover:bg-amber-1 cursor-pointer px-4 py-1 line-height-5 transition-all rd-4 
                flex items-center justify-center
                ${now !== item.key ? style.hover_icon : 'bg-amber-1'}`}
              key={item.key}
              onClick={() => select(item.key)}
            >
              <span className={`${item.icon} ${now === item.key ? 'text-4 mx-2' :
                'text-0'} font-900`}></span>
              {item.value}
              {
                now === item.key &&
                <span className={`text-3 mx-2 align-bottom line-height-4`}>
                  共计{people?.count}人
                </span>
              }

            </span>
          ))
        }
      </div>
      <div className='bg-white rd-b-8 h-100 pb-2'>
        <div className={`inline-block text-amber-9 font-800 text-4
        flex items-center justify-start flex-col max-w-2xl gap-4 m-4 mt-0 h-[90%] ${style.scroll_container}`}>
          {
            people?.list.map((manager) => (
              <div className={`${style.person} animate-slide-in-left animate-duration-200`} key={manager.id}>
                <div className='flex items-start gap-2'>
                  {/* <img className='w-12 h-12 rd-4' src={manager.avatar} alt="" /> */}
                  <Avatar
                    alt={manager.nickName}
                    src={manager.avatar || generateAvatar(manager.id || "")}
                    size='default'
                  >
                    {manager.nickName}
                  </Avatar>
                  <div>
                    <div>{manager.nickName}</div>
                    <div className='text-3.5 font-normal mt-1'>{manager.signature}</div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>

  )
}

interface HeaderProps {
  name: string;
  description: string;
  owner: string;
}

function Header({
  name, description, owner
}: HeaderProps) {
  const treeContainer = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const toDrawTree = () => {
    if (treeContainer.current && canvasRef.current) {
      drawTree(treeContainer.current, canvasRef.current);
    }
  }

  useEffect(() => {
    toDrawTree();
  }, [treeContainer.current, canvasRef.current])

  return (
    <div className={`flex items-center justify-left overflow-hidden mb-10
       border-amber border-5 border-solid rd-5 shadow-amber shadow-sm
       `}>
      <div className='flex items-center justify-left m-3'>
        <div className="w-40 h-30 !max-w-none flex-shrink-0 mr-4 bg-center bg-cover rd-5 overflow-hidden">
          <GenerativeBg
            type="terrain"
            content={name}
          />
        </div>
        <div className='line-height-normal flex items-center justify-center'>
          <div>
            <div className="text-5 font-700 text-[--semi-color-text-0] inline-block">
              {name}
              <span className='ml-2 font-1 font-400 text-[--semi-color-text-2] text-4
             text-shadow-color-[--semi-color-text-2] text-shadow-sm'>
                @{owner}
              </span>
            </div>
            <div
              className='text-4 font-400 text-[--semi-color-text-1]'>
              {description}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${style.basic_inf} flex-grow h-36 pl-20`}
        ref={treeContainer}
      >
        <canvas className='absolute left-0 top-0' ref={canvasRef}></canvas>
      </div>
    </div>

  )
}

export default function Page() {
  const { currentKb } = useKnowledgeBase();
  const [owner, setOwner] = useState('');

  const [selectedPeopleList, setSelectedPeopleList] = useState<string>('managerCount')
  const selectNewPeopleList = (new_key: string) => {
    setSelectedPeopleList(new_key)
  }

  useEffect(() => {
    if (currentKb)
      for (const manager of currentKb?.managerCount.list) {
        if (manager.id === currentKb?.detail?.creatorUserId) {
          setOwner(manager.nickName);
          break;
        }
      }
  }, [currentKb])

  useEffect(() => {
    console.log('currentKb', currentKb);
  })
  return (
    <div className='text-[--semi-brand-5]'>
      <Header name={currentKb?.detail?.name!} description={currentKb?.detail?.description!} owner={owner} />
      <div className='flex items-start justify-center mx-auto gap-20'>
        <PeopleList people={currentKb?.[selectedPeopleList]!} selectNewPeopleList={selectNewPeopleList} />
        <DetailBtns currentKb={currentKb} />
      </div>
    </div>
  );
}
