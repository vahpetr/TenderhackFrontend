import {
  useState,
  useEffect,
} from "react";
import {useParams} from "react-router-dom";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

interface ThunderhackCustomerPageRouteParams {
  type: string;
  inn: string;
  kpp: string;
}

interface Organization {
  id: number;
  name: string;
  inn: string;
  kpp: string;
}

interface Order {
  id: number;
  quantity: number;
  amount: number;
  productId: number | null;
}

interface ScoredOrder {
  order: Order;
  score: number;
}

interface Category {
  id: number;
  title: string;
  kpgz: string;
}

interface Product {
  id: number;
  name: string;
  category: Category;
}

const columns: GridColDef[] = [
  { field: 'productId', headerName: '№', width: 100 },
  { field: 'name', headerName: 'Наименование', width: 300 },
  { field: 'categoryTitle', headerName: 'Категория', width: 300 },
  { field: 'categoryKpgz', headerName: 'КПГЗ', width: 200 },
  { field: 'quantity', headerName: 'Количество', width: 150 },
  { field: 'amount', headerName: 'Цена', width: 150 },
  { field: 'medianPrice', headerName: 'Средняя цена', width: 150 },
  { field: 'score', headerName: 'Оценка', width: 150 },
];

const rowSelector = (p: ScoredOrder, productsMap: {[key: number]: Product}) => {
  var order = p.order;
  return {
    ...order,
    name: order.productId ? productsMap[order.productId].name : 'n/a',
    categoryTitle: order.productId ? productsMap[order.productId].category.title : 'n/a',
    categoryKpgz: order.productId ? productsMap[order.productId].category.kpgz : 'n/a',
    medianPrice: (order.amount / order.quantity).toFixed(2),
    score: p.score
  };
}

function ThunderhackPredicionPage() {
  const { type, inn, kpp } = useParams<ThunderhackCustomerPageRouteParams>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [predictions, setPredictions] = useState<GridRowsProp[]>([]);

  useEffect(() => {
    const getOrganization = async () => {
      const responce = await fetch(`https://localhost:7029/api/v1/organizations?inns=${inn}&kpps=${kpp}`)
      if(responce.ok) {
        const result = await responce.json();
        if (result.length === 1) {
          setOrganization(result[0]);
        } else {
          setOrganization({ name: "Не удалось найти" } as Organization );
        }
      }
    };
    const getPredictions = async (yearOffset: number = -1) => {
      const predictor = type === "producer" ? "demands" : "purchases"
      const predictedResponce = await fetch(`https://localhost:7029/api/v1/orders/predict/${predictor}?inn=${inn}&kpp=${kpp}&yearOffset=${yearOffset}`)
      if(predictedResponce.ok) {
        const scoredOrders = await predictedResponce.json() as ScoredOrder[];
        const predictedProductIds = scoredOrders.filter(p => p.order.productId !== null).map(p => p.order.productId);
        if (predictedProductIds.length !== 0) {
          const ids = predictedProductIds.sort().reduce((text, id) => `${text}&ids=${id}`, '')
          const productsResponce = await fetch(`https://localhost:7029/api/v1/products?${ids}`)
          if (productsResponce.ok) {
            const productsResult = await productsResponce.json() as Product[];
            const productsMap = productsResult.reduce((map, curr) => {
              //@ts-ignore
              map[curr.id] = curr;
              return map;
            }, {});

          return {
            scoredOrders,
            productsMap
          };
          }
        }
      }
      return {
        scoredOrders: [],
        productsMap: {}
      };
    };

    getOrganization();

    Promise.all([
      getPredictions(-3),
      getPredictions(-2),
      getPredictions(-1)
    ]).then(predict => {
      // TODO add group by id and mul to score
      const scoredOrders = [
        ...predict[0].scoredOrders,
        ...predict[1].scoredOrders,
        ...predict[2].scoredOrders
      ]
      const grouped: {[key: number]: ScoredOrder} = {};
      for (const scoredOrder of scoredOrders) {
        if (!grouped[scoredOrder.order.id]) {
          grouped[scoredOrder.order.id] = scoredOrder;
        } else {
          grouped[scoredOrder.order.id].score += scoredOrder.score;
          grouped[scoredOrder.order.id].order.amount += scoredOrder.order.amount;
          grouped[scoredOrder.order.id].order.quantity += scoredOrder.order.quantity;
        }
      }
      var values = []
      for (const id in grouped) {
        values.push(grouped[id])
      }

      var sorted = values.sort((a,b) => b.score - a.score)
      const orders = sorted;
      const productsMap = {
        ...predict[0].productsMap,
        ...predict[1].productsMap,
        ...predict[2].productsMap,
      }
      const rows = orders.map(p => rowSelector(p, productsMap));
      // @ts-ignore
      setPredictions(rows);
    });

  }, [type, inn, kpp]);

  const text = type === "producer" ? "Скоро начнутся закупки" : "Вам скоро понадоится"

  if (organization) {
    return <div>
      <h4 style={{
        textAlign: 'right'
      }}>{organization?.name}. ИНН: {inn}. КПП: {kpp}</h4>
      <h3>{text}</h3>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid rows={predictions} columns={columns} />
      </div>
    </div>
  } else {
    return <div>Loading...</div>
  }
}

export default ThunderhackPredicionPage;
