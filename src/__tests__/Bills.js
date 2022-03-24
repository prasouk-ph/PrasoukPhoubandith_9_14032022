/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js";
import '@testing-library/jest-dom' // allows to use toHaveClass


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I click on eye icon", () => {
    test("Then a modal with the bill proof in it should pop up", () => {
      const bill = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      $.fn.modal = jest.fn() // prevent error modal is not a function
      const eyeIcon = screen.getAllByTestId('icon-eye')
      const handleClickIconEye = jest.fn(bill.handleClickIconEye(eyeIcon[0])) // handleClickIconEye needs an attribute
      eyeIcon[0].addEventListener('click', handleClickIconEye)
      userEvent.click(eyeIcon[0])
      expect(handleClickIconEye).toHaveBeenCalled()

      const modaleFile = document.querySelector('#modaleFile')
      expect(modaleFile).toBeTruthy()
      
      // console.log(modaleFile.className)
      // expect(modaleFile).toHaveClass('show')
      const modaleBody = document.querySelector('.modal-body')
      expect(modaleBody.childNodes.length).toEqual(1)
    })
  })

  describe("When the proof modal is opened and I click on the close button", () => {
    test("Then the modal should close", () => {
      const closeButton = document.querySelector('.close')
      userEvent.click(closeButton)
      const modaleFile = document.querySelector('#modaleFile')
      expect(modaleFile).not.toHaveClass('show')
    })
  })

  describe("When I click on new bill button", () => {
    test("I should be sent on new bill page", () => {
      // Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // window.localStorage.setItem('user', JSON.stringify({
      //   type: 'Employee'
      // }))

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const bill = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills})

      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      buttonNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
})