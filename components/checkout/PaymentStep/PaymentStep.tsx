import React, { useState, useEffect, ChangeEvent } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import Help from '@mui/icons-material/Help'
import {
  Stack,
  Checkbox,
  FormControlLabel,
  styled,
  Radio,
  FormControl,
  RadioGroup,
  Typography,
  Button,
  Box,
  Tooltip,
  MenuItem,
} from '@mui/material'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'
import { useReCaptcha } from 'next-recaptcha-v3'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { CardDetailsForm, PurchaseOrderForm } from '@/components/checkout'
import {
  AddressForm,
  KiboTextBox,
  KiboRadio,
  PaymentBillingCard,
  KiboSelect,
  KeyValueDisplay,
} from '@/components/common'
import { useCheckoutStepContext, STEP_STATUS, useAuthContext, useSnackbarContext } from '@/context'
import {
  useGetCards,
  useGetCustomerAddresses,
  usePaymentTypes,
  useValidateCustomerAddress,
} from '@/hooks'
import { CurrencyCode, PaymentType, PaymentWorkflow } from '@/lib/constants'
import { addressGetters, cardGetters, orderGetters, userGetters } from '@/lib/getters'
import {
  buildCardPaymentActionForCheckoutParams,
  tokenizeCreditCardPayment,
  validateGoogleReCaptcha,
} from '@/lib/helpers'
import type {
  Address,
  CardForm,
  ContactForm,
  SavedCard,
  TokenizedCard,
  PaymentAndBilling,
  CardTypeForCheckout,
} from '@/lib/types'

import type {
  CrContact,
  CrAddress,
  CrOrder,
  PaymentActionInput,
  Checkout,
  CuAddress,
} from '@/lib/gql/types'

interface PaymentStepProps {
  checkout: CrOrder | Checkout
  contact?: ContactForm
  isMultiShipEnabled?: boolean
  addressCollection?: CustomerContactCollection
  cardCollection?: CardCollection
  customerPurchaseOrderAccount?: CustomerPurchaseOrderAccount
  installmentPlans: any[]
  onVoidPayment: (id: string, paymentId: string, paymentAction: PaymentActionInput) => Promise<void>
  onAddPayment: (id: string, paymentAction: PaymentActionInput) => Promise<void>
  updateCheckoutPersonalInfo: (params: any) => Promise<void>
}

interface PaymentMethod {
  id: string
  name: string
}

const StyledHeadings = styled(Typography)(() => ({
  width: '100%',
  paddingLeft: '0.5rem',
  fontWeight: 'bold',
}))

const formControlLabelStyle = {
  backgroundColor: 'grey.100',
  height: '3.313rem',
  width: '100%',
  marginLeft: '0',
  marginBottom: '1.75rem',
}

const radioStyle = {
  color: 'primary',
  '& .Mui-checked': {
    color: 'primary',
  },
}

const initialCardFormData: CardForm = {
  cardNumber: '',
  cardType: '',
  expireMonth: 0,
  expireYear: 0,
  cvv: '',
  isCardDetailsValidated: false,
  isCardInfoSaved: false,
}

const initialBillingAddressData: Address = {
  contact: {
    firstName: '',
    lastNameOrSurname: '',
    email: '',
    address: {
      address1: '',
      address2: '',
      cityOrTown: '',
      stateOrProvince: '',
      postalOrZipCode: '',
      countryCode: '',
    },
    phoneNumbers: {
      home: '',
    },
  },
  isSameBillingShippingAddress: false,
  isAddressValid: false,
}

const PaymentStep = (props: PaymentStepProps) => {
  const {
    checkout,
    isMultiShipEnabled = false,
    cardCollection,
    addressCollection,
    customerPurchaseOrderAccount,
    installmentPlans,
    onVoidPayment,
    onAddPayment,
    updateCheckoutPersonalInfo,
  } = props

  // hooks
  const { isAuthenticated, user } = useAuthContext()
  const { validateCustomerAddress } = useValidateCustomerAddress()

  const { t } = useTranslation('common')

  const { executeRecaptcha } = useReCaptcha()
  const { showSnackbar } = useSnackbarContext()

  const { publicRuntimeConfig } = getConfig()
  const reCaptchaKey = publicRuntimeConfig.recaptcha.reCaptchaKey

  const { loadPaymentTypes } = usePaymentTypes()
  const paymentMethods = loadPaymentTypes()

  // getting saved card and billing details
  const { data: customerCardsCollection, isSuccess: isCustomerCardsSuccess } = useGetCards(
    user?.id as number
  )

  const { data: customerContactsCollection, isSuccess: isCustomerContactsSuccess } =
    useGetCustomerAddresses(user?.id as number)

  // checkout context handling
  const {
    stepStatus,
    setStepNext,
    setStepStatusValid,
    setStepStatusComplete,
    setStepStatusIncomplete,
  } = useCheckoutStepContext()

  // states
  const [newPaymentMethod, setNewPaymentMethod] = useState<string>('')
  const [cardFormDetails, setCardFormDetails] = useState<CardForm>(initialCardFormData)

  const [billingFormAddress, setBillingFormAddress] = useState<Address>(initialBillingAddressData)
  const [validateForm, setValidateForm] = useState<boolean>(false)
  const [isAddingNewPayment, setIsAddingNewPayment] = useState<boolean>(false)

  const [isInstallmentEnabled, setIsInstallmentEnabled] = useState<boolean>(
    !!(checkoutPayment as any)?.installmentPlanCode
  )
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string>(
    (checkoutPayment as any)?.installmentPlanCode
  )

  // const [installmentPlans, setInstallmentPlans] = useState<any[]>([])
  const selectedInstallment = installmentPlans.find(
    (installment) => installment?.plan_code === selectedInstallmentId
  )

  const handlePaymentTypeRadioChange = (value: string) => {
    setSelectedPaymentTypeRadio(value)
    setIsAddingNewPayment(false)
    setBillingFormAddress(initialBillingAddressData)
  }
  // Purchase Order details
  const handleInitialPODetails: SavedPODetails | null = useMemo(() => {
    return checkoutPaymentType === PaymentType.PURCHASEORDER
      ? {
          purchaseOrder: checkoutPayment?.billingInfo?.purchaseOrder as CrPurchaseOrderPayment,
          billingAddressInfo: {
            contact: checkoutPayment?.billingInfo?.billingContact as CrContact,
          },
        }
      : null
  }, [checkoutPaymentType, checkoutPayment])

  const [
    savedPaymentBillingDetailsForPurchaseOrder,
    setSavedPaymentBillingDetailsForPurchaseOrder,
  ] = useState<SavedPODetails | null>(handleInitialPODetails)

  const creditLimit = customerPurchaseOrderAccount?.creditLimit ?? 0
  const availableBalance = customerPurchaseOrderAccount?.availableBalance ?? 0
  const customerPurchaseOrderPaymentTerms = (
    customerPurchaseOrderAccount?.customerPurchaseOrderPaymentTerms as CustomerPurchaseOrderPaymentTerm[]
  )?.filter(
    (purchaseOrderTerm: CustomerPurchaseOrderPaymentTerm) =>
      purchaseOrderTerm.siteId === checkout.siteId
  )

  const [cvv, setCvv] = useState<string>('')

  const useDetailsSchema = () => {
    return yup.object().shape({
      cvv: yup
        .string()
        .required(t('cvv-is-required'))
        .matches(/^\d{3,4}$/g, t('invalid-cvv')),
    })
  }

  const defaultCvv = {
    cvv: '',
  }
  const {
    formState: { errors, isValid },
    control,
  } = useForm({
    mode: 'all',
    reValidateMode: 'onBlur',
    defaultValues: defaultCvv,
    resolver: yupResolver(useDetailsSchema()),
    shouldFocusError: true,
  })

  // default card details if payment method is card
  const defaultCustomerAccountCard = userGetters.getDefaultPaymentBillingMethod(
    savedPaymentBillingDetails
  )

  // handle saved payment method radio selection to select different payment method
  const handleRadioSavedCardSelection = (value: string) => {
    setStepStatusIncomplete()
    setSelectedPaymentBillingRadio(value)
    setCvv('')
    setIsCVVAddedForNewPayment(false)
  }

  const shouldShowPurchaseOrderForm =
    selectedPaymentTypeRadio === PaymentType.PURCHASEORDER && isAddingNewPayment

  const shouldShowBillingAddressForm = shouldShowCardForm || shouldShowPurchaseOrderForm

  const shouldShowPreviouslySavedCards =
    selectedPaymentTypeRadio === PaymentType.CREDITCARD && cardOptions.length && !isAddingNewPayment

  const shouldShowInstallmentPlans =
    shouldShowPreviouslySavedCards && checkout.items?.some((item) => item?.subscription)

  // Form Data
  const [cardFormDetails, setCardFormDetails] = useState<CardForm>({})

  const handleCardFormData = (cardData: CardForm) => {
    setCardFormDetails({
      ...cardFormDetails,
      ...cardData,
    })

    setCvv(cardData.cvv as string)
  }

  const handleSameAsShippingAddressCheckbox = (value: boolean) => {
    let address = initialBillingAddressData
    if (value) {
      address = {
        contact: (checkout as CrOrder)?.fulfillmentInfo?.fulfillmentContact as ContactForm,
      }
    } else if (billingFormAddress.isDataUpdated) {
      address = billingFormAddress
    }

    setBillingFormAddress({
      ...address,
      isAddressValid: true,
      isSameBillingShippingAddress: value,
    })
  }

  const handleBillingFormAddress = (address: Address) => {
    const updatedAddress = {
      contact: {
        ...address.contact,
      },
      email: checkout?.email,
      isAddressValid: true,
      isDataUpdated: address.isDataUpdated,
    } as Address
    setBillingFormAddress(updatedAddress)
  }

  // when adding new payment method, set payment method type (ex: credit card / check)
  const handlePaymentMethodSelection = (event: ChangeEvent<HTMLInputElement>) => {
    setIsAddingNewPayment(true)
    setNewPaymentMethod(event.target.value)
  }

  const submitFormWithRecaptcha = () => {
    if (!executeRecaptcha) {
      console.log('Execute recaptcha not yet available')
      return
    }
    executeRecaptcha('enquiryFormSubmit').then(async (gReCaptchaToken: any) => {
      const captcha = await validateGoogleReCaptcha(gReCaptchaToken)

      if (captcha?.status === 'success') {
        await saveCardDataToOrder()
      } else {
        showSnackbar(captcha.message, 'error')
      }
    })
  }

  const shouldShowPreviouslySavedPayments = () => {
    if (Boolean(savedPaymentBillingDetails?.length)) {
      return isAddingNewPayment ? false : true
    }
    return false
  }

  const shouldShowPaymentMethodOptions = () => {
    if (!savedPaymentBillingDetails?.length || isAddingNewPayment) return true

    return false
  }

  const shouldShowCardForm = () => {
    if (isAddingNewPayment && newPaymentMethod === PaymentType.CREDITCARD) {
      return true
    }

    return false
  }

  const shouldShowBillingAddressForm = () => {
    if (isAddingNewPayment && Boolean(newPaymentMethod)) {
      return true
    }
    return false
  }

  const isAddPaymentMethodButtonDisabled = () => {
    return !(billingFormAddress.isAddressValid && cardFormDetails.isCardDetailsValidated)
  }

  const cancelAddingNewPaymentMethod = () => {
    setIsAddingNewPayment(false)
    setNewPaymentMethod('')
    setBillingFormAddress(initialBillingAddressData)
    setCardFormDetails(initialCardFormData)
  }

  const handleCardFormValidDetails = (isValid: boolean) => {
    setCardFormDetails({ ...cardFormDetails, isCardDetailsValidated: isValid })
  }

  const handleBillingFormValidDetails = (isValid: boolean) => {
    setBillingFormAddress({ ...billingFormAddress, isAddressValid: isValid })
  }

  const handleAddPaymentMethod = () => {
    setBillingFormAddress(initialBillingAddressData)
    setIsAddingNewPayment(true)
  }

  // Sets validateForm to true to get the card and billing details
  const handleSaveNewPaymentMethod = async () => {
    setValidateForm(true)
  }

  const saveCardDataToOrder = async () => {
    let paymentAction: PaymentActionInput = {}

    const selectedPaymentMethod = savedPaymentBillingDetails.find(
      (each) => each?.cardInfo?.id === selectedPaymentBillingRadio
    )

    if (newPaymentMethod === PaymentType.CREDITCARD) {
      const {
        cardType,
        expireMonth,
        expireYear,
        isCardInfoSaved,
        paymentType,
        cardNumberPart,
        id,
        cardholderName,
      } = cardGetters.getCardDetails(selectedPaymentMethod?.cardInfo as SavedCard)

      if (!isCVVAddedForNewPayment) {
        await handleTokenization({
          id,
          cardType,
          cvv,
          cardNumber: cardNumberPart,
          cardholderName,
        })
      }

      const cardDetails: CardTypeForCheckout = {
        cardType,
        expireMonth,
        expireYear,
        isCardInfoSaved,
        paymentType,
        paymentWorkflow: PaymentWorkflow.MOZU,
      }

      const tokenizedData: TokenizedCard = {
        id,
        numberPart: cardNumberPart,
      }

      const isSameAsShipping = addressGetters.getIsBillingShippingAddressSame(
        selectedPaymentMethod?.billingAddressInfo
      )

      paymentAction = buildCardPaymentActionForCheckoutParams(
        CurrencyCode.US,
        checkout,
        cardDetails,
        tokenizedData,
        selectedPaymentMethod?.billingAddressInfo?.contact as CrContact,
        isSameAsShipping
      )

      const paymentsWithNewStatus = orderGetters.getSelectedPaymentMethods(
        checkout,
        PaymentType.CREDITCARD
      )

      if (
        paymentsWithNewStatus?.billingInfo?.card?.paymentServiceCardId ===
        selectedPaymentBillingRadio
      ) {
        setStepStatusComplete()
        setStepNext()
        return
      }

      if (paymentsWithNewStatus) {
        const card = paymentsWithNewStatus?.billingInfo?.card
        cardDetails.cardType = card?.paymentOrCardType as string
        cardDetails.expireMonth = card?.expireMonth as number
        cardDetails.expireYear = card?.expireYear as number
        cardDetails.paymentType = paymentsWithNewStatus?.paymentType as string

        let paymentActionToBeVoided = buildCardPaymentActionForCheckoutParams(
          CurrencyCode.US,
          checkout,
          cardDetails,
          tokenizedData,
          paymentsWithNewStatus?.billingInfo?.billingContact as CrContact,
          isSameAsShipping
        )

        paymentActionToBeVoided = { ...paymentActionToBeVoided, actionName: 'VoidPayment' }
        await onVoidPayment(
          checkout?.id as string,
          paymentsWithNewStatus?.id as string,
          paymentActionToBeVoided
        )
      }

      if (checkout?.id) {
        paymentAction = { ...paymentAction, actionName: '' }
        await onAddPayment(checkout.id, paymentAction)
        setStepStatusComplete()
        setStepNext()
      }
    }
  }

  const handleTokenization = async (card: CardForm) => {
    const { publicRuntimeConfig } = getConfig()
    const pciHost = publicRuntimeConfig?.pciHost
    const apiHost = publicRuntimeConfig?.apiHost as string
    const tokenizedCardResponse: TokenizedCard = await tokenizeCreditCardPayment(
      card,
      pciHost,
      apiHost
    )

    if (!tokenizedCardResponse) return

    setIsAddingNewPayment(false)

    setSavedPaymentBillingDetails([
      ...savedPaymentBillingDetails,
      {
        cardInfo: {
          id: tokenizedCardResponse.id,
          cardNumberPart: tokenizedCardResponse.numberPart,
          paymentType: newPaymentMethod,
          expireMonth: card.expireMonth,
          expireYear: card.expireYear,
          isCardInfoSaved: card.isCardInfoSaved,
          cardType: card.cardType,
        },
        billingAddressInfo: {
          ...billingFormAddress,
          isSameBillingShippingAddress: billingFormAddress.isSameBillingShippingAddress,
        },
      },
    ])

    setSelectedPaymentBillingRadio(tokenizedCardResponse.id as string)
    setValidateForm(false)
    setIsCVVAddedForNewPayment(true)
  }

  const handleInitialCardDetailsLoad = () => {
    setStepStatusIncomplete()

    // get card and billing address formatted data from server
    const accountPaymentDetails =
      userGetters.getSavedCardsAndBillingDetails(
        customerCardsCollection,
        customerContactsCollection
      ) || []

    // get previously saved checkout payments
    const checkoutPaymentWithNewStatus = orderGetters.getSelectedPaymentMethods(
      checkout,
      PaymentType.CREDITCARD
    )

    // if checkoutPayment details are not present in accountPaymentDetails, push it and set it as selected radio
    if (checkoutPaymentWithNewStatus) {
      const cardDetails = checkoutPaymentWithNewStatus?.billingInfo?.card
      const billingAddress = checkoutPaymentWithNewStatus?.billingInfo?.billingContact
      Boolean(
        !accountPaymentDetails?.length ||
          !accountPaymentDetails?.some(
            (each) => each.cardInfo?.id === cardDetails?.paymentServiceCardId
          )
      ) &&
        accountPaymentDetails?.push({
          cardInfo: {
            cardNumberPart: cardDetails?.cardNumberPartOrMask as string,
            id: cardDetails?.paymentServiceCardId as string,
            expireMonth: cardDetails?.expireMonth,
            expireYear: cardDetails?.expireYear,
            paymentType: PaymentType.CREDITCARD,
            cardType: cardDetails?.paymentOrCardType as string,
          },
          billingAddressInfo: {
            contact: {
              ...billingAddress,
            },
          },
        })

      setSelectedPaymentBillingRadio(cardDetails?.paymentServiceCardId as string)
    }

    // find default payment details from server data
    const defaultCard = userGetters.getDefaultPaymentBillingMethod(accountPaymentDetails)

    // if defaultCard is available, set as selected radio
    cardGetters.getCardId(defaultCard?.cardInfo) &&
      selectedPaymentBillingRadio === '' &&
      setSelectedPaymentBillingRadio(defaultCard.cardInfo?.id as string)

    if (accountPaymentDetails?.length) {
      setSavedPaymentBillingDetails(accountPaymentDetails)
      setNewPaymentMethod(PaymentType.CREDITCARD)
    }
  }

  // handle saved payment method radio selection to select different payment method
  const handleRadioSavedCardSelection = (value: string) => {
    setStepStatusIncomplete()
    setSelectedCardRadio(value)
    setIsCVVAddedForNewPayment(false)
    resetField('cvv')
  }

  const handleAddPaymentMethod = () => {
    setBillingFormAddress(initialBillingAddressData)
    setIsAddingNewPayment(true)
  }

  const handleTokenization = async (card: CardForm) => {
    const pciHost = publicRuntimeConfig?.pciHost
    const apiHost = publicRuntimeConfig?.apiHost as string
    const tokenizedCardResponse: TokenizedCard = await tokenizeCreditCardPayment(
      card,
      pciHost,
      apiHost
    )

    if (!tokenizedCardResponse) return

    setIsAddingNewPayment(false)

    if (!cardOptions.some((each) => each.cardInfo?.id === tokenizedCardResponse.id)) {
      setCardOptions([
        ...cardOptions,
        {
          cardInfo: {
            id: tokenizedCardResponse.id,
            cardNumberPart: tokenizedCardResponse.numberPart,
            paymentType: PaymentType.CREDITCARD,
            expireMonth: card.expireMonth,
            expireYear: card.expireYear,
            isCardInfoSaved: card.isCardInfoSaved,
            cardType: card.cardType,
          },
          billingAddressInfo: {
            ...billingFormAddress,
            isSameBillingShippingAddress: billingFormAddress.isSameBillingShippingAddress,
          },
        },
      ])
    }

    setSelectedCardRadio(tokenizedCardResponse.id as string)
    setValidateForm(false)
    setIsCVVAddedForNewPayment(true)
  }

  const handlePurchaseOrderValidation = async (purchaseOrderFormData: any) => {
    setIsAddingNewPayment(false)
    setSavedPaymentBillingDetailsForPurchaseOrder({
      purchaseOrder: {
        purchaseOrderNumber: purchaseOrderFormData?.purchaseOrderNumber,
        paymentTerm: purchaseOrderFormData?.paymentTerm,
      },
      billingAddressInfo: {
        ...billingFormAddress,
        isSameBillingShippingAddress: billingFormAddress.isSameBillingShippingAddress,
      },
    })
    setValidateForm(false)
  }

  const handleValidateBillingAddress = async (address: CuAddress) => {
    try {
      await validateCustomerAddress.mutateAsync({
        addressValidationRequestInput: {
          address,
        },
      })
      handleTokenization({ ...cardFormDetails })
    } catch (error) {
      setValidateForm(false)
      console.error(error)
    }
  }

  const submitFormWithRecaptcha = () => {
    if (!executeRecaptcha) {
      console.log('Execute recaptcha not yet available')
      return
    }
    executeRecaptcha('enquiryFormSubmit').then(async (gReCaptchaToken: any) => {
      const captcha = await validateGoogleReCaptcha(gReCaptchaToken)

      if (captcha?.status === 'success') {
        await handlePayment()
      } else {
        showSnackbar(captcha.message, 'error')
      }
    })
  }

  const getCardPaymentAction = async () => {
    let paymentActionToBeAdded: PaymentActionInput = {}
    let paymentActionToBeVoided: PaymentActionInput = {}

    const selectedPaymentMethod = cardOptions.find(
      (each) => each?.cardInfo?.id === selectedCardRadio
    )

    const {
      cardType,
      expireMonth,
      expireYear,
      isCardInfoSaved,
      paymentType,
      cardNumberPart,
      id,
      cardholderName,
    } = cardGetters.getCardDetails(selectedPaymentMethod?.cardInfo as SavedCard)

    if (!isCVVAddedForNewPayment) {
      await handleTokenization({
        id,
        cardType,
        cvv,
        cardNumber: cardNumberPart,
        cardholderName,
      })
    }

    const cardDetails: CardTypeForCheckout = {
      cardType,
      expireMonth,
      expireYear,
      isCardInfoSaved,
      paymentType,
      paymentWorkflow: PaymentWorkflow.MOZU,
    }

    const tokenizedData: TokenizedCard = {
      id,
      numberPart: cardNumberPart,
    }

    const isSameAsShipping = addressGetters.getIsBillingShippingAddressSame(
      selectedPaymentMethod?.billingAddressInfo
    )

    const paymentWithNewStatus = orderGetters.getSelectedPaymentType(checkout)

    if (paymentWithNewStatus?.billingInfo?.card?.paymentServiceCardId === selectedCardRadio) {
      if (selectedInstallmentId === (paymentWithNewStatus as any)?.installmentPlanCode) {
        setStepStatusComplete()
        setStepNext()
        return
      }
    }
    paymentActionToBeAdded = {
      ...buildCardPaymentActionForCheckoutParams(
        CurrencyCode.US,
        checkout,
        { ...cardDetails },
        tokenizedData,
        selectedPaymentMethod?.billingAddressInfo?.contact as CrContact,
        isSameAsShipping,
        isInstallmentEnabled && selectedInstallmentId ? selectedInstallmentId : ''
      ),
      actionName: '',
    }

    if (paymentWithNewStatus?.paymentType === PaymentType.CREDITCARD) {
      const card = paymentWithNewStatus?.billingInfo?.card
      const voidedCard = {
        paymentWorkflow: paymentWithNewStatus?.paymentWorkflow as string,
        isCardInfoSaved: card?.isCardInfoSaved as boolean,
        cardType: card?.paymentOrCardType as string,
        expireMonth: card?.expireMonth as number,
        expireYear: card?.expireYear as number,
        paymentType: paymentWithNewStatus?.paymentType as string,
      }

      paymentActionToBeVoided = buildCardPaymentActionForCheckoutParams(
        CurrencyCode.US,
        checkout,
        voidedCard,
        tokenizedData,
        paymentWithNewStatus?.billingInfo?.billingContact as CrContact,
        isSameAsShipping
      )

      paymentActionToBeVoided = { ...paymentActionToBeVoided, actionName: 'VoidPayment' }
    }

    return {
      paymentActionToBeAdded,
      paymentActionToBeVoided,
      paymentId: paymentWithNewStatus?.id as string,
    }
  }

  const getPurchaseOrderPaymentAction = () => {
    let paymentActionToBeAdded: PaymentActionInput = {}
    let paymentActionToBeVoided: PaymentActionInput = {}

    const isSameAsShipping = addressGetters.getIsBillingShippingAddressSame(
      savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo
    )
    const purchaseOrderData = savedPaymentBillingDetailsForPurchaseOrder?.purchaseOrder ?? {}

    const paymentWithNewStatus = orderGetters.getSelectedPaymentType(checkout)

    if (paymentWithNewStatus?.paymentType === PaymentType.PURCHASEORDER) {
      const purchaseOrderDataWithNewStatus = {
        purchaseOrderNumber: paymentWithNewStatus?.billingInfo?.purchaseOrder?.purchaseOrderNumber,
        purchaseOrderPaymentTerms: paymentWithNewStatus?.billingInfo?.purchaseOrder?.paymentTerm,
      }

      paymentActionToBeVoided = buildPurchaseOrderPaymentActionForCheckoutParams(
        CurrencyCode.US,
        checkout,
        purchaseOrderDataWithNewStatus,
        paymentWithNewStatus?.billingInfo?.billingContact as CrContact,
        isSameAsShipping
      )

      paymentActionToBeVoided = { ...paymentActionToBeVoided, actionName: 'VoidPayment' }
    }

    paymentActionToBeAdded = {
      ...buildPurchaseOrderPaymentActionForCheckoutParams(
        CurrencyCode.US,
        checkout,
        purchaseOrderData,
        savedPaymentBillingDetailsForPurchaseOrder?.billingAddressInfo?.contact as CrContact,
        isSameAsShipping
      ),
      actionName: '',
    }

    return {
      paymentActionToBeAdded,
      paymentActionToBeVoided,
      paymentId: paymentWithNewStatus?.id as string,
    }
  }

  const handlePayment = async () => {
    const paymentMethodSelection: any = {
      [PaymentType.PURCHASEORDER]: getPurchaseOrderPaymentAction,
      [PaymentType.CREDITCARD]: getCardPaymentAction,
    }

    const responseForVoid =
      checkoutPaymentType && (await paymentMethodSelection[checkoutPaymentType]())

    if (responseForVoid?.paymentActionToBeVoided?.actionName) {
      await onVoidPayment(
        checkout?.id as string,
        responseForVoid.paymentId,
        responseForVoid.paymentActionToBeVoided
      )
    }

    const responseForAdd =
      selectedPaymentTypeRadio && (await paymentMethodSelection[selectedPaymentTypeRadio]())

    if (checkout?.id && responseForAdd?.paymentActionToBeAdded) {
      await onAddPayment(checkout.id, responseForAdd?.paymentActionToBeAdded)
      setStepStatusComplete()
      setStepNext()
    }
  }

  useEffect(() => {
    // handle saved payment methods in account
    if ((isCustomerCardsSuccess && isCustomerContactsSuccess) || !isAuthenticated) {
      handleInitialCardDetailsLoad()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCustomerCardsSuccess, isCustomerContactsSuccess, checkout])

  // when payment card and billing address info is available, handleTokenization
  useEffect(() => {
    if (
      isAddingNewPayment &&
      validateForm &&
      cardFormDetails.cardNumber &&
      billingFormAddress.contact.firstName
    ) {
      handleValidateBillingAddress({ ...billingFormAddress.contact.address })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAddingNewPayment,
    validateForm,
    cardFormDetails.cardNumber,
    billingFormAddress.contact.firstName,
  ])
  // handling review order button status (enabled/disabled)
  useEffect(() => {
    if (selectedPaymentBillingRadio) {
      isAddingNewPayment || !cvv ? setStepStatusIncomplete() : setStepStatusValid()
    } else {
      setStepStatusIncomplete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentBillingRadio, isAddingNewPayment])

  useEffect(() => {
    if (stepStatus === STEP_STATUS.SUBMIT) {
      reCaptchaKey ? submitFormWithRecaptcha() : saveCardDataToOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepStatus])

  useEffect(() => {
    isValid ? setStepStatusValid() : setStepStatusIncomplete()
  }, [isValid])

  return (
    <Stack data-testid="checkout-payment">
      <Typography variant="h2" sx={{ paddingBottom: '1.625rem' }}>
        {t('payment-method')}
      </Typography>

      {shouldShowPreviouslySavedPayments() && (
        <>
          <Stack gap={2} width="100%" data-testid="saved-payment-methods">
            {savedPaymentBillingDetails?.length ? (
              <>
                <KiboRadio
                  radioOptions={savedPaymentBillingDetails?.map((card) => {
                    const address = addressGetters.getAddress(
                      card?.billingAddressInfo?.contact.address as CrAddress
                    )
                    return {
                      value: cardGetters.getCardId(card?.cardInfo),
                      name: cardGetters.getCardId(card?.cardInfo),
                      optionIndicator:
                        defaultCustomerAccountCard.cardInfo?.id === card.cardInfo?.id
                          ? t('primary')
                          : '',
                      label: (
                        <>
                          <PaymentBillingCard
                            cardNumberPart={cardGetters.getCardNumberPart(card?.cardInfo)}
                            expireMonth={cardGetters.getExpireMonth(card?.cardInfo)}
                            expireYear={cardGetters.getExpireYear(card?.cardInfo)}
                            cardType={cardGetters.getCardType(card?.cardInfo).toUpperCase()}
                            address1={addressGetters.getAddress1(address)}
                            address2={addressGetters.getAddress2(address)}
                            cityOrTown={addressGetters.getCityOrTown(address)}
                            postalOrZipCode={addressGetters.getPostalOrZipCode(address)}
                            stateOrProvince={addressGetters.getStateOrProvince(address)}
                          />
                        ) : null}
                      </>
                    ) : null}
                    {shouldShowPurchaseOrderForm ? (
                      <PurchaseOrderForm
                        creditLimit={creditLimit}
                        availableBalance={availableBalance}
                        validateForm={validateForm}
                        purchaseOrderPaymentTerms={customerPurchaseOrderPaymentTerms}
                        onSavePurchaseData={handlePurchaseOrderFormData}
                        onFormStatusChange={handlePurchaseOrderFormValidDetails}
                      />
                    ) : null}
                    {shouldShowBillingAddressForm ? (
                      <>
                        <StyledHeadings variant="h2" sx={{ paddingTop: '3.125rem' }}>
                          {t('billing-address')}
                        </StyledHeadings>
                        {!isMultiShipEnabled &&
                          (checkout as CrOrder)?.fulfillmentInfo?.shippingMethodCode &&
                          (checkout as CrOrder)?.fulfillmentInfo?.shippingMethodName && (
                            <FormControlLabel
                              sx={{
                                width: '100%',
                                paddingLeft: '0.5rem',
                              }}
                              control={
                                <Checkbox name={`${t('billing-address-same-as-shipping')}`} />
                              }
                              label={`${t('billing-address-same-as-shipping')}`}
                              onChange={(_, value) => handleSameAsShippingAddressCheckbox(value)}
                            />
                          )}
                        <AddressForm
                          key={selectedPaymentTypeRadio}
                          contact={billingFormAddress.contact}
                          setAutoFocus={false}
                          isUserLoggedIn={isAuthenticated}
                          onSaveAddress={handleBillingFormAddress}
                          validateForm={validateForm}
                          onFormStatusChange={handleBillingFormValidDetails}
                        />
                        <Stack pl={1} gap={2} sx={{ width: { xs: '100%', md: '50%' } }}>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={cancelAddingNewPaymentMethod}
                          >
                            {t('cancel')}
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            {...(isAddPaymentMethodButtonDisabled() && { disabled: true })}
                            onClick={handleSaveNewPaymentMethod}
                          >
                            {t('save-payment-method')}
                          </Button>
                        </Stack>
                      </>
                    ) : null}
                    {!(shouldShowPurchaseOrderForm || shouldShowCardForm) ? (
                      <>
                        {shouldShowInstallmentPlans ? (
                          <FormControlLabel
                            sx={{
                              width: '100%',
                              paddingLeft: '0.5rem',
                            }}
                            control={
                              <Checkbox
                                checked={isInstallmentEnabled}
                                onChange={(_, checked) => {
                                  setIsInstallmentEnabled(checked)
                                  setSelectedInstallmentId('')
                                }}
                                data-testid="pay-to-installments"
                              />
                            }
                            label={`${t('Pay in installments')}`}
                          />
                        ) : null}

                        {isInstallmentEnabled && (
                          <Box sx={{ pl: 5 }}>
                            <Box pb={1}>
                              <Typography variant="h4">{t('Installment plan details')}</Typography>
                            </Box>
                            <Box pb={1} width="60%">
                              <KiboSelect
                                name={'adjustment'}
                                value={selectedInstallmentId}
                                onChange={(_, value) => {
                                  setSelectedInstallmentId(value)
                                }}
                              >
                                {installmentPlans?.map((option: any) => (
                                  <MenuItem
                                    sx={{ typography: 'body2' }}
                                    key={option?.id}
                                    value={option?.plan_code}
                                  >
                                    {`${option?.no_of_payments} installments for ${option?.installment_frequency} days`}
                                  </MenuItem>
                                ))}
                              </KiboSelect>
                            </Box>

                            {selectedInstallment && (
                              <>
                                <KeyValueDisplay
                                  option={{
                                    name: 'First installment amount',
                                    value: selectedInstallment.first_payment_amount,
                                  }}
                                />
                                <KeyValueDisplay
                                  option={{
                                    name: 'Frequency',
                                    value: `${selectedInstallment.installment_frequency} days`,
                                  }}
                                />
                                <KeyValueDisplay
                                  option={{
                                    name: 'Total number of payments',
                                    value: selectedInstallment.no_of_payments,
                                  }}
                                />
                              </>
                            )}
                          </Box>
                        )}

                        <Box pt={2}>
                          <Button
                            variant="contained"
                            color="inherit"
                            sx={{ width: { xs: '100%', sm: '50%' } }}
                            onClick={handleAddPaymentMethod}
                          >
                            {t('add-payment-method')}
                          </Button>
                        </Box>
                      </>
                    ) : null}
                  </Box>
                ) : null}
              </Box>
            )
          })}
        </RadioGroup>
      </FormControl>
    </Stack>
  )
}

export default PaymentStep
